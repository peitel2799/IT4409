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
  const { socket, isConnected } = useSocket();
  const { authUser } = useAuth();

  // Call state
  const [callState, setCallState] = useState({
    isInCall: false,
    isRinging: false,
    isReceivingCall: false,
    callId: null,
    callType: null, // 'video' or 'audio'
    remoteUser: null,
    callStatus: "idle", // idle, ringing, connecting, connected, ended
  });

  // Streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Refs
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const pendingCallerRef = useRef(null); // Store caller info while waiting for offer
  const answerProcessedRef = useRef(false); // Flag to prevent duplicate answer processing
  const callAcceptedRef = useRef(false); // Flag to prevent duplicate call:accept emissions
  const callAcceptedProcessedRef = useRef(false); // Flag to prevent duplicate call:accepted handling (caller side)

  // Keep socket ref updated
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Incoming call info (for showing incoming call modal)
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Track if current stream has video
  const [hasVideo, setHasVideo] = useState(false);

  // Get user media with fallback
  const getUserMedia = useCallback(async (isVideo = true) => {
    // If we already have a stream, check if it matches the request
    if (localStreamRef.current) {
      const currentHasVideo = localStreamRef.current.getVideoTracks().length > 0;
      
      // If requesting video but current stream doesn't have it, try to get new stream
      if (isVideo && !currentHasVideo) {
        console.log("Current stream has no video, trying to get video stream...");
        // Stop current stream first
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      } else {
        console.log("Returning existing stream:", localStreamRef.current.id, "hasVideo:", currentHasVideo);
        return localStreamRef.current;
      }
    }
    
    // Audio constraints
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };
    
    // Video constraints - try multiple levels
    const videoConstraintsHigh = {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 },
      facingMode: "user"
    };
    
    const videoConstraintsBasic = {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: "user"
    };
    
    // First, try to get both video and audio
    if (isVideo) {
      // Try high quality video first
      try {
        console.log("Trying high quality video...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraintsHigh,
          audio: audioConstraints,
        });
        console.log("Got HIGH quality video + audio stream:", stream.id);
        console.log("Video tracks:", stream.getVideoTracks().length);
        console.log("Audio tracks:", stream.getAudioTracks().length);
        setLocalStream(stream);
        setHasVideo(true);
        localStreamRef.current = stream;
        return stream;
      } catch (error) {
        console.warn("High quality video failed:", error.message);
        
        // Try basic video constraints
        try {
          console.log("Trying basic video constraints...");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraintsBasic,
            audio: audioConstraints,
          });
          console.log("Got BASIC video + audio stream:", stream.id);
          console.log("Video tracks:", stream.getVideoTracks().length);
          setLocalStream(stream);
          setHasVideo(true);
          localStreamRef.current = stream;
          return stream;
        } catch (error2) {
          console.warn("Basic video failed:", error2.message);
          
          // Try simplest video: true
          try {
            console.log("Trying simplest video: true...");
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: audioConstraints,
            });
            console.log("Got SIMPLE video + audio stream:", stream.id);
            console.log("Video tracks:", stream.getVideoTracks().length);
            setLocalStream(stream);
            setHasVideo(true);
            localStreamRef.current = stream;
            return stream;
          } catch (error3) {
            console.warn("All video attempts failed, trying audio only:", error3.message);
            // Fallback to audio only
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: audioConstraints,
              });
              console.log("Got audio-only stream (video fallback):", audioStream.id);
              setLocalStream(audioStream);
              setHasVideo(false);
              localStreamRef.current = audioStream;
              return audioStream;
            } catch (audioError) {
              console.error("Could not get audio either:", audioError.message);
              return null;
            }
          }
        }
      }
    } else {
      // Audio only call
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: audioConstraints,
        });
        console.log("Got audio-only stream:", stream.id);
        setLocalStream(stream);
        setHasVideo(false);
        localStreamRef.current = stream;
        return stream;
      } catch (error) {
        console.error("Could not get audio:", error.message);
        return null;
      }
    }
  }, []);

  // Stop all tracks in a stream
  const stopStream = useCallback((stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(
    (recipientId, callId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc:ice-candidate", {
            recipientId,
            candidate: event.candidate,
            callId,
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log("=== Connection state changed:", pc.connectionState);
        if (pc.connectionState === "connected") {
          console.log("Setting call status to connected!");
          setCallState((prev) => ({ ...prev, callStatus: "connected" }));
        } else if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          console.log("Connection failed/disconnected, ending call");
          endCall(recipientId, callId);
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log("=== ICE connection state:", pc.iceConnectionState);
        // Also set connected when ICE connection is connected/completed
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          console.log("ICE connected, setting call status to connected!");
          setCallState((prev) => ({ ...prev, callStatus: "connected" }));
        }
      };

      // Handle incoming tracks (remote stream)
      pc.ontrack = (event) => {
        console.log("=== RECEIVED REMOTE TRACK ===");
        console.log("Track kind:", event.track.kind);
        console.log("Track enabled:", event.track.enabled);
        console.log("Track muted:", event.track.muted);
        console.log("Stream:", event.streams[0]?.id);
        if (event.streams[0]) {
          setRemoteStream(event.streams[0]);
          console.log("Remote stream set!");
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
      console.log("=== INITIATE CALL ===");
      console.log("ReceiverId:", receiverId);
      console.log("ReceiverInfo:", receiverInfo);
      console.log("IsVideo:", isVideo);
      
      // Wait for socket to be available (max 5 seconds)
      let waitTime = 0;
      const maxWait = 5000;
      const checkInterval = 100;
      
      while (!socketRef.current && waitTime < maxWait) {
        console.log("Waiting for socket...", waitTime);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waitTime += checkInterval;
      }
      
      const currentSocket = socketRef.current;
      
      console.log("Socket available:", !!currentSocket);
      console.log("AuthUser:", authUser?._id);
      
      if (!currentSocket || !authUser) {
        console.error("Socket not available after waiting");
        return false;
      }

      try {
        // Get local media first
        console.log("Getting user media...");
        const stream = await getUserMedia(isVideo);
        console.log("Got media stream:", stream.id);

        setCallState({
          isInCall: true,
          isRinging: true,
          isReceivingCall: false,
          callId: null,
          callType: isVideo ? "video" : "audio",
          remoteUser: receiverInfo,
          callStatus: "ringing",
        });

        // Emit call initiation
        console.log("Emitting call:initiate event...");
        currentSocket.emit("call:initiate", {
          receiverId,
          callerInfo: {
            id: authUser._id,
            name: authUser.fullName,
            avatar: authUser.profilePic,
          },
          isVideo,
        });
        console.log("call:initiate emitted!");
        
        return true;
      } catch (error) {
        console.error("Error initiating call:", error);
        setCallState({
          isInCall: false,
          isRinging: false,
          isReceivingCall: false,
          callId: null,
          callType: null,
          remoteUser: null,
          callStatus: "idle",
        });
        return false;
      }
    },
    [authUser, getUserMedia]
  );

  // Accept incoming call - just notify caller and wait for offer
  const acceptCall = useCallback(
    async (callId, callerId, callerInfo, isVideo) => {
      console.log("=== ACCEPT CALL ===");
      console.log("CallId:", callId);
      console.log("CallerId:", callerId);
      console.log("IsVideo:", isVideo);
      
      // Prevent duplicate call:accept emissions
      if (callAcceptedRef.current) {
        console.log("call:accept already emitted, skipping duplicate");
        return;
      }
      callAcceptedRef.current = true;
      
      // Wait for socket to be available (max 5 seconds)
      let waitTime = 0;
      const maxWait = 5000;
      const checkInterval = 100;
      
      while (!socketRef.current && waitTime < maxWait) {
        console.log("Waiting for socket in acceptCall...", waitTime);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waitTime += checkInterval;
      }
      
      const currentSocket = socketRef.current;
      
      console.log("Socket available:", !!currentSocket);
      console.log("AuthUser:", authUser?._id);
      
      if (!currentSocket || !authUser) {
        console.error("Cannot accept call - socket or authUser missing after waiting");
        callAcceptedRef.current = false; // Reset on failure
        return;
      }

      // Get media stream ready (but don't create peer connection yet)
      let stream = localStreamRef.current;
      if (!stream) {
        console.log("Getting media stream for receiver...");
        stream = await getUserMedia(isVideo);
      }
      console.log("Receiver has stream:", stream?.id);

      // Update call state - we're accepting but waiting for WebRTC offer
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

      // Store caller info for later use when creating peer connection
      pendingCallerRef.current = { callerId, callId, isVideo };

      // Notify caller that call was accepted - caller will then send WebRTC offer
      console.log("Emitting call:accept to server...");
      currentSocket.emit("call:accept", {
        callId,
        callerId,
        receiverInfo: {
          id: authUser._id,
          name: authUser.fullName,
          avatar: authUser.profilePic,
        },
      });
      console.log("call:accept emitted! Waiting for WebRTC offer...");
    },
    [authUser, getUserMedia]
  );

  // Reject incoming call
  const rejectCall = useCallback(
    (callId, callerId, reason = "Call declined") => {
      if (!socket) return;

      socket.emit("call:reject", {
        callId,
        callerId,
        reason,
      });

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
    },
    [socket]
  );

  // End call
  const endCall = useCallback(
    (recipientId, callId) => {
      if (socket && recipientId && callId) {
        socket.emit("call:end", {
          callId,
          recipientId,
        });
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Stop local stream
      stopStream(localStreamRef.current);
      setLocalStream(null);
      setHasVideo(false);
      localStreamRef.current = null;

      // Reset state
      setRemoteStream(null);
      setIncomingCall(null);
      pendingCandidatesRef.current = [];
      pendingCallerRef.current = null;
      answerProcessedRef.current = false; // Reset answer flag
      callAcceptedRef.current = false; // Reset call accepted flag
      callAcceptedProcessedRef.current = false; // Reset call accepted processed flag

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
    [socket, stopStream]
  );

  // Toggle microphone
  const toggleMic = useCallback((forceState) => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      console.log("Toggle mic - tracks:", audioTracks.length);
      audioTracks.forEach((track) => {
        const newState = forceState !== undefined ? forceState : !track.enabled;
        track.enabled = newState;
        console.log("Audio track enabled:", track.enabled);
      });
      return audioTracks[0]?.enabled ?? false;
    }
    console.log("No local stream for mic toggle");
    return false;
  }, []);

  // Toggle camera
  const toggleCamera = useCallback((forceState) => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      console.log("Toggle camera - tracks:", videoTracks.length);
      videoTracks.forEach((track) => {
        const newState = forceState !== undefined ? forceState : !track.enabled;
        track.enabled = newState;
        console.log("Video track enabled:", track.enabled);
      });
      return videoTracks[0]?.enabled ?? false;
    }
    console.log("No local stream for camera toggle");
    return false;
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log("CallContext: Socket not available yet");
      return;
    }
    
    console.log("CallContext: Setting up socket listeners, socket id:", socket.id);

    // Incoming call
    const handleIncomingCall = ({ callId, callerId, callerInfo, isVideo }) => {
      console.log("=== INCOMING CALL EVENT RECEIVED ===");
      console.log("CallId:", callId);
      console.log("CallerId:", callerId);
      console.log("CallerInfo:", callerInfo);
      console.log("IsVideo:", isVideo);
      console.log("Current isInCall:", callState.isInCall);

      // If already in a call, send busy signal
      if (callState.isInCall) {
        console.log("Already in call, sending busy signal");
        socket.emit("call:busy", { callId, callerId });
        return;
      }

      console.log("Setting incoming call state...");
      setIncomingCall({
        callId,
        callerId,
        callerInfo,
        isVideo,
      });

      setCallState((prev) => ({
        ...prev,
        isReceivingCall: true,
      }));
      console.log("Incoming call state set!");
    };

    // Call ringing (caller side)
    const handleCallRinging = ({ callId, receiverId }) => {
      console.log("=== CALL RINGING ===");
      console.log("CallId:", callId);
      console.log("ReceiverId:", receiverId);
      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isRinging: true,
        callId,
        callStatus: "ringing",
      }));
    };

    // Call accepted (caller side) - now create offer
    const handleCallAccepted = async ({ callId, receiverId, receiverInfo }) => {
      console.log("=== CALL ACCEPTED (Caller side) ===");
      console.log("CallId:", callId);
      console.log("ReceiverId:", receiverId);
      console.log("ReceiverInfo:", receiverInfo);
      console.log("LocalStream:", localStreamRef.current?.id);

      // Prevent duplicate handling
      if (callAcceptedProcessedRef.current) {
        console.log("call:accepted already processed, skipping");
        return;
      }
      callAcceptedProcessedRef.current = true;

      setCallState((prev) => ({
        ...prev,
        isRinging: false,
        callStatus: "connecting",
        callId,
      }));

      // Check if peer connection already exists (prevent duplicate)
      if (peerConnectionRef.current) {
        console.log("Peer connection already exists, skipping creation");
        return;
      }

      // Create peer connection
      console.log("Creating peer connection for caller...");
      const pc = createPeerConnection(receiverId, callId);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log("Adding track to PC:", track.kind, track.enabled);
          pc.addTrack(track, localStreamRef.current);
        });
        console.log("Total senders:", pc.getSenders().length);
      } else {
        console.error("No local stream available for caller!");
      }

      // Create and send offer
      try {
        console.log("Creating WebRTC offer...");
        const offer = await pc.createOffer();
        console.log("Offer SDP (first 200 chars):", offer.sdp?.substring(0, 200));
        await pc.setLocalDescription(offer);
        console.log("Offer created, sending to receiver...");

        socket.emit("webrtc:offer", {
          recipientId: receiverId,
          offer,
          callId,
        });
        console.log("WebRTC offer sent!");
      } catch (error) {
        console.error("Error creating offer:", error);
        endCall(receiverId, callId);
      }
    };

    // Call rejected
    const handleCallRejected = ({ callId, receiverId, reason }) => {
      console.log("Call rejected:", reason);
      
      // Set status to rejected first (so UI can show message)
      setCallState(prev => ({
        ...prev,
        callStatus: "rejected",
      }));
      
      // Then cleanup after a short delay
      setTimeout(() => {
        endCall(receiverId, callId);
      }, 100);
    };

    // Call ended
    const handleCallEnded = ({ callId, endedBy, reason }) => {
      console.log("Call ended by:", endedBy, reason);
      endCall(null, null);
    };

    // Call unavailable (user offline)
    const handleCallUnavailable = ({ receiverId, reason }) => {
      console.log("Call unavailable:", reason);
      stopStream(localStreamRef.current);
      setLocalStream(null);
      localStreamRef.current = null;
      setCallState({
        isInCall: false,
        isRinging: false,
        isReceivingCall: false,
        callId: null,
        callType: null,
        remoteUser: null,
        callStatus: "unavailable",
      });
    };

    // Call busy
    const handleCallBusy = ({ callId, receiverId }) => {
      console.log("User is busy");
      stopStream(localStreamRef.current);
      setLocalStream(null);
      localStreamRef.current = null;
      setCallState({
        isInCall: false,
        isRinging: false,
        isReceivingCall: false,
        callId: null,
        callType: null,
        remoteUser: null,
        callStatus: "busy",
      });
    };

    // WebRTC offer (receiver side) - create peer connection here
    const handleWebRTCOffer = async ({ callId, senderId, offer }) => {
      console.log("=== RECEIVED WEBRTC OFFER ===");
      console.log("CallId:", callId);
      console.log("SenderId (caller):", senderId);
      
      // Check if we have pending caller info
      const callerInfo = pendingCallerRef.current;
      console.log("Pending caller info:", callerInfo);

      // Check if peer connection already exists (prevent duplicate)
      if (peerConnectionRef.current) {
        console.log("Receiver: Peer connection already exists, skipping");
        return;
      }

      try {
        // Create peer connection NOW (after receiving offer)
        console.log("Creating peer connection for receiver...");
        const pc = createPeerConnection(senderId, callId);

        // Add local tracks BEFORE setting remote description
        const stream = localStreamRef.current;
        if (stream) {
          stream.getTracks().forEach((track) => {
            console.log("Adding local track to PC:", track.kind, track.enabled);
            pc.addTrack(track, stream);
          });
          console.log("Total senders:", pc.getSenders().length);
        } else {
          console.warn("No local stream available for receiver");
        }

        // Now set remote description (the offer)
        console.log("Setting remote description (offer)...");
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Remote description set, state:", pc.signalingState);

        // Process any pending ICE candidates
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Added pending ICE candidate");
          } catch (e) {
            console.error("Error adding pending ICE candidate:", e);
          }
        }
        pendingCandidatesRef.current = [];

        // Create and send answer
        console.log("Creating answer...");
        const answer = await pc.createAnswer();
        console.log("Answer SDP (first 200 chars):", answer.sdp?.substring(0, 200));
        await pc.setLocalDescription(answer);
        console.log("Answer created and set as local description");

        socket.emit("webrtc:answer", {
          recipientId: senderId,
          answer,
          callId,
        });
        console.log("WebRTC answer sent!");
        
        // Clear pending caller info
        pendingCallerRef.current = null;
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    // WebRTC answer (caller side)
    // WebRTC answer (caller side)
    const handleWebRTCAnswer = async ({ callId, senderId, answer }) => {
      console.log("Received WebRTC answer");
      
      // Check if already processed an answer
      if (answerProcessedRef.current) {
        console.log("Answer already processed, ignoring duplicate");
        return;
      }
      
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error("No peer connection for answer!");
        return;
      }

      console.log("PC signaling state:", pc.signalingState);
      
      // Only process answer if we're in the right state (have-local-offer)
      if (pc.signalingState !== "have-local-offer") {
        console.log("Ignoring answer - PC not in have-local-offer state, current:", pc.signalingState);
        return;
      }

      // Mark as processed BEFORE async operation
      answerProcessedRef.current = true;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Answer set as remote description, state:", pc.signalingState);
        
        // Process any pending ICE candidates
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Added pending ICE candidate");
          } catch (e) {
            console.error("Error adding pending ICE candidate:", e);
          }
        }
        pendingCandidatesRef.current = [];
      } catch (error) {
        console.error("Error handling answer:", error);
        // Reset flag on error so it can be retried
        answerProcessedRef.current = false;
      }
    };

    // ICE candidate
    const handleICECandidate = async ({ callId, senderId, candidate }) => {
      const pc = peerConnectionRef.current;

      if (!pc || !pc.remoteDescription) {
        // Queue the candidate
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    // Register event listeners
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:ringing", handleCallRinging);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:unavailable", handleCallUnavailable);
    socket.on("call:busy", handleCallBusy);
    socket.on("webrtc:offer", handleWebRTCOffer);
    socket.on("webrtc:answer", handleWebRTCAnswer);
    socket.on("webrtc:ice-candidate", handleICECandidate);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:ringing", handleCallRinging);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:unavailable", handleCallUnavailable);
      socket.off("call:busy", handleCallBusy);
      socket.off("webrtc:offer", handleWebRTCOffer);
      socket.off("webrtc:answer", handleWebRTCAnswer);
      socket.off("webrtc:ice-candidate", handleICECandidate);
    };
  }, [socket, callState.isInCall, createPeerConnection, endCall, stopStream]);

  const value = {
    // State
    callState,
    localStream,
    remoteStream,
    incomingCall,
    setIncomingCall,
    hasVideo,

    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
    getUserMedia,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
};
