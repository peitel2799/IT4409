import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const CallContext = createContext();

// STUN/TURN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { authUser } = useAuth();

  // Call state
  const [callState, setCallState] = useState({
    isInCall: false,
    isRinging: false,
    isReceivingCall: false,
    callId: null,
    callType: null, // 'video' or 'audio'
    remoteUser: null,
    callStatus: "idle", // idle, ringing, connecting, connected, ended, rejected, busy
  });

  // Streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);

  // Keep socket ref updated
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Incoming call info
  const [incomingCall, setIncomingCall] = useState(null);
  const [hasVideo, setHasVideo] = useState(false);

  // Stop all tracks in a stream
  const stopStream = useCallback((stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  // Get user media logic
  const getUserMedia = useCallback(async (isVideo = true) => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo ? { facingMode: "user" } : false,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setLocalStream(stream);
      setHasVideo(isVideo);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error getting media:", error);
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(
    (recipientId, callId) => {
      if (peerConnectionRef.current) return peerConnectionRef.current;

      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc:ice-candidate", {
            recipientId,
            candidate: event.candidate,
            callId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams[0]) setRemoteStream(event.streams[0]);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallState((prev) => ({ ...prev, callStatus: "connected" }));
        } else if (
          ["disconnected", "failed", "closed"].includes(pc.connectionState)
        ) {
          endCall(recipientId, callId);
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [socket]
  );

  // Initiate a call
  const initiateCall = useCallback(
    async (receiverId, receiverInfo, isVideo = true) => {
      const stream = await getUserMedia(isVideo);
      if (!stream || !socketRef.current) return false;

      setCallState({
        isInCall: true,
        isRinging: true,
        isReceivingCall: false,
        callId: null,
        callType: isVideo ? "video" : "audio",
        remoteUser: receiverInfo,
        callStatus: "ringing",
      });

      socketRef.current.emit("call:initiate", {
        receiverId,
        callerInfo: {
          id: authUser._id,
          name: authUser.fullName,
          avatar: authUser.profilePic,
        },
        isVideo,
      });
      return true;
    },
    [authUser, getUserMedia]
  );

  // Accept incoming call
  const acceptCall = useCallback(
    async (callId, callerId, callerInfo, isVideo) => {
      await getUserMedia(isVideo);
      setCallState({
        isInCall: true,
        isRinging: false,
        isReceivingCall: false,
        callId,
        callType: isVideo ? "video" : "audio",
        remoteUser: callerInfo,
        callStatus: "connecting",
      });
      setIncomingCall(null);
      socketRef.current.emit("call:accept", {
        callId,
        callerId,
        receiverInfo: {
          id: authUser._id,
          name: authUser.fullName,
          avatar: authUser.profilePic,
        },
      });
    },
    [authUser, getUserMedia]
  );

  const endCall = useCallback(
    (recipientId, callId) => {
      if (socketRef.current && recipientId && callId) {
        socketRef.current.emit("call:end", { callId, recipientId });
      }
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      stopStream(localStreamRef.current);
      localStreamRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      setCallState({
        isInCall: false,
        isRinging: false,
        isReceivingCall: false,
        callId: null,
        callType: null,
        remoteUser: null,
        callStatus: "idle",
      });
    },
    [stopStream]
  );

  // Reject an incoming call
  const rejectCall = useCallback((callId, callerId) => {
    if (socketRef.current && callId && callerId) {
      socketRef.current.emit("call:reject", {
        callId,
        callerId,
        reason: "Call declined",
      });
    }
    setIncomingCall(null);
    setCallState({
      isInCall: false,
      isRinging: false,
      isReceivingCall: false,
      callId: null,
      callType: null,
      remoteUser: null,
      callStatus: "idle",
    });
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleWebRTCOffer = async ({ callId, senderId, offer }) => {
      const pc = createPeerConnection(senderId, callId);
      localStreamRef.current
        ?.getTracks()
        .forEach((t) => pc.addTrack(t, localStreamRef.current));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { recipientId: senderId, answer, callId });
    };

    const handleWebRTCAnswer = async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleCallAccepted = async ({ callId, receiverId }) => {
      const pc = createPeerConnection(receiverId, callId);
      localStreamRef.current
        ?.getTracks()
        .forEach((t) => pc.addTrack(t, localStreamRef.current));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { recipientId: receiverId, offer, callId });
    };

    socket.on("call:incoming", (data) => {
      if (callState.isInCall)
        return socket.emit("call:busy", {
          callId: data.callId,
          callerId: data.callerId,
        });
      setIncomingCall(data);
      setCallState((p) => ({ ...p, isReceivingCall: true }));
    });

    socket.on("call:accepted", handleCallAccepted);
    socket.on("webrtc:offer", handleWebRTCOffer);
    socket.on("webrtc:answer", handleWebRTCAnswer);
    socket.on("webrtc:ice-candidate", ({ candidate }) => {
      peerConnectionRef.current?.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });
    socket.on("call:rejected", () =>
      setCallState((p) => ({ ...p, callStatus: "rejected" }))
    );
    socket.on("call:busy", () =>
      setCallState((p) => ({ ...p, callStatus: "busy" }))
    );
    socket.on("call:ended", () => endCall());

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      socket.off("call:rejected");
      socket.off("call:busy");
      socket.off("call:ended");
    };
  }, [socket, callState.isInCall, createPeerConnection, endCall]);

  return (
    <CallContext.Provider
      value={{
        callState,
        localStream,
        remoteStream,
        incomingCall,
        setIncomingCall,
        hasVideo,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        getUserMedia,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
