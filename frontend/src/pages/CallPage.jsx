import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeftRight, User, LoaderIcon, VideoIcon } from "lucide-react";
import { useCall } from "../context/CallContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function CallPage() {
  // --- Get info from URL ---
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "Remote";
  const avatar = searchParams.get("avatar");
  const recipientId = searchParams.get("id");
  const isVideoCall = searchParams.get("video") === "true";
  const isReceiver = searchParams.get("receiver") === "true";
  const isCaller = searchParams.get("caller") === "true"; // New: check if this is caller window
  const callIdParam = searchParams.get("callId");

  const { authUser, isCheckingAuth } = useAuth();
  const { isConnected, socket } = useSocket();
  const {
    callState,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    endCall,
    toggleMic,
    toggleCamera,
    getUserMedia,
    hasVideo,
  } = useCall();

  // --- State ---
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(isVideoCall);
  const [isSwapped, setIsSwapped] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  
  // Track if remote has video
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);

  // --- Refs ---
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const initializingRef = useRef(false); // Prevent multiple initializations
  const callerMediaReadyRef = useRef(false); // Prevent caller from getting media twice

  // --- Debug: Log socket state on mount ---
  useEffect(() => {
    console.log("=== CallPage mounted ===");
    console.log("isConnected:", isConnected);
    console.log("socket:", socket);
    console.log("authUser:", authUser);
    console.log("isCheckingAuth:", isCheckingAuth);
    console.log("URL params:", { recipientId, callIdParam, isReceiver, isCaller, isVideoCall });
  }, []);

  // --- Debug: Log when socket state changes ---
  useEffect(() => {
    console.log("=== Socket state changed ===");
    console.log("isConnected:", isConnected);
    console.log("socket:", socket);
  }, [isConnected, socket]);

  // --- Initialize call when socket is connected ---
  useEffect(() => {
    // Use sessionStorage to prevent multiple initializations across StrictMode remounts
    const sessionKey = `call_initialized_${callIdParam || recipientId}`;
    const alreadyInitialized = sessionStorage.getItem(sessionKey);
    
    if (alreadyInitialized || initializingRef.current || hasInitialized) {
      console.log("=== SKIPPING INIT (already initialized) ===", {
        sessionStorage: alreadyInitialized,
        ref: initializingRef.current,
        state: hasInitialized
      });
      return;
    }
    if (isCheckingAuth || !authUser) return; // Wait for auth check
    if (!isConnected) return; // Wait for socket connection

    // Mark as initializing immediately to prevent race conditions
    initializingRef.current = true;
    sessionStorage.setItem(sessionKey, 'true');

    const initCall = async () => {
      console.log("=== INITIALIZING CALL WINDOW ===");
      console.log("isCaller:", isCaller, "isReceiver:", isReceiver);
      console.log("callIdParam:", callIdParam);
      console.log("recipientId (caller ID for receiver):", recipientId);
      console.log("Socket connected:", isConnected);
      console.log("AuthUser:", authUser?._id);
      
      if (isReceiver && callIdParam && recipientId) {
        // This is the receiver - accept the call and get media
        console.log("=== RECEIVER FLOW ===");
        console.log("Getting media first...");
        
        const stream = await getUserMedia(isVideoCall);
        if (stream) {
          console.log("Receiver got stream:", stream.id, "tracks:", stream.getTracks().length);
        } else {
          console.warn("Receiver could not get media, continuing anyway...");
        }
        
        // Now accept the call (this will create peer connection and emit call:accept)
        console.log("Calling acceptCall...");
        console.log("Params: callId=", callIdParam, "callerId=", recipientId);
        try {
          await acceptCall(callIdParam, recipientId, { id: recipientId, name, avatar }, isVideoCall);
          console.log("acceptCall completed!");
          setCallInitiated(true);
        } catch (error) {
          console.error("Error in acceptCall:", error);
        }
        setHasInitialized(true);
      } else if (isCaller && recipientId) {
        // This is the caller window - call:initiate was already emitted from main window
        // Just need to get media and wait for call events
        
        // Skip if caller already got media (socket reconnect scenario)
        if (callerMediaReadyRef.current) {
          console.log("=== CALLER FLOW SKIPPED (already has media) ===");
          return;
        }
        callerMediaReadyRef.current = true;
        
        console.log("=== CALLER FLOW ===");
        console.log("Getting media...");
        
        const stream = await getUserMedia(isVideoCall);
        if (stream) {
          console.log("Caller got stream:", stream.id, "tracks:", stream.getTracks().length);
        } else {
          console.warn("Caller could not get media, continuing anyway...");
        }
        setCallInitiated(true);
        setHasInitialized(true);
      } else if (recipientId && !isReceiver && !isCaller) {
        // Legacy: This is the caller initiating the call (for backwards compatibility)
        const success = await initiateCall(
          recipientId,
          { id: recipientId, name, avatar },
          isVideoCall
        );
        if (success) {
          console.log("Call initiated successfully");
          setCallInitiated(true);
          setHasInitialized(true);
        } else {
          console.log("Call initiation failed, will retry...");
          initializingRef.current = false; // Allow retry
          setInitAttempts(prev => prev + 1);
        }
      }
    };

    initCall();
  }, [
    hasInitialized,
    isReceiver,
    isCaller,
    callIdParam,
    recipientId,
    name,
    avatar,
    isVideoCall,
    initiateCall,
    acceptCall,
    getUserMedia,
    isCheckingAuth,
    authUser,
    isConnected,
    initAttempts,
  ]);

  // --- Attach local stream to video element ---
  useEffect(() => {
    console.log("Local stream effect - stream:", localStream?.id, "ref:", !!localVideoRef.current);
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("Local stream attached to video element");
      console.log("Local video tracks:", localStream.getVideoTracks().length);
    }
  }, [localStream]);

  // --- Attach remote stream to video element ---
  useEffect(() => {
    console.log("=== Remote stream effect ===");
    console.log("Remote stream:", remoteStream?.id);
    console.log("Remote stream tracks:", remoteStream?.getTracks().map(t => ({kind: t.kind, enabled: t.enabled, muted: t.muted})));
    
    if (remoteStream) {
      // Check if remote has video tracks
      const videoTracks = remoteStream.getVideoTracks();
      const hasVideoTrack = videoTracks.length > 0 && videoTracks.some(t => t.enabled);
      setRemoteHasVideo(hasVideoTrack);
      console.log("Remote has video:", hasVideoTrack);
    }
    
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("Remote stream attached to video element");
    }
  }, [remoteStream]);

  // --- Start call duration timer when connected ---
  useEffect(() => {
    if (callState.callStatus === "connected") {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callState.callStatus]);

  // --- Track if we've received any call event (to know call actually started) ---
  const [callEventReceived, setCallEventReceived] = useState(false);

  // --- Watch for call state changes to know when call actually started ---
  useEffect(() => {
    // Mark that we received a call event when status changes from idle
    if (callState.callStatus !== "idle" && !callEventReceived) {
      console.log("Call event received, status:", callState.callStatus);
      setCallEventReceived(true);
    }
  }, [callState.callStatus, callEventReceived]);

  // --- Handle call ended ---
  useEffect(() => {
    // Only close window if:
    // 1. Call was initiated (callInitiated)
    // 2. Window was initialized (hasInitialized)
    // 3. We actually received a call event (callEventReceived) - prevents closing before call starts
    // 4. Status is now idle (call ended)
    if (callState.callStatus === "idle" && callInitiated && hasInitialized && callEventReceived) {
      console.log("Call ended, closing window...");
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }, [callState.callStatus, callInitiated, hasInitialized, callEventReceived]);

  // --- Cleanup sessionStorage on window close ---
  useEffect(() => {
    const sessionKey = `call_initialized_${callIdParam || recipientId}`;
    
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(sessionKey);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sessionStorage.removeItem(sessionKey);
    };
  }, [callIdParam, recipientId]);

  // --- Handle unavailable/busy/rejected status ---
  useEffect(() => {
    // Only close if call was actually initiated
    if ((callState.callStatus === "unavailable" || callState.callStatus === "busy" || callState.callStatus === "rejected") && callInitiated) {
      console.log("Call status:", callState.callStatus, "- closing window in 2 seconds");
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [callState.callStatus, callInitiated]);

  // --- Control Mic/Cam ---
  const handleToggleMic = () => {
    console.log("Toggle mic clicked, current state:", isMicOn);
    const newState = toggleMic();
    console.log("New mic state:", newState);
    setIsMicOn(newState);
  };

  const handleToggleCam = () => {
    console.log("Toggle cam clicked, current state:", isCamOn);
    const newState = toggleCamera();
    console.log("New cam state:", newState);
    setIsCamOn(newState);
  };

  // --- End call ---
  const handleEndCall = () => {
    // Clear sessionStorage to allow new calls
    const sessionKey = `call_initialized_${callIdParam || recipientId}`;
    sessionStorage.removeItem(sessionKey);
    
    const targetId = recipientId || callState.remoteUser?.id;
    const currentCallId = callState.callId || callIdParam;
    endCall(targetId, currentCallId);
    window.close();
  };

  // --- Format duration ---
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Get status text ---
  const getStatusText = () => {
    switch (callState.callStatus) {
      case "ringing":
        return "Ringing...";
      case "connecting":
        return "Connecting...";
      case "connected":
        return formatDuration(callDuration);
      case "unavailable":
        return "User is offline";
      case "busy":
        return "User is busy";
      default:
        return "Connecting...";
    }
  };

  // --- CSS for screens ---
  const fullScreen = `absolute inset-0 w-full h-full object-cover z-0`;
  const smallScreen = `absolute top-5 right-5 w-48 h-36 bg-gray-800 rounded-xl border border-white/20 shadow-2xl cursor-pointer overflow-hidden z-20`;

  // Refs for audio element (separate from video for reliable audio playback)
  const remoteAudioRef = useRef(null);

  // Get the remote user's avatar URL
  const remoteAvatarUrl = avatar || callState.remoteUser?.avatar;
  const remoteName = name || callState.remoteUser?.name || "Remote";

  // --- Attach remote stream to audio element for reliable audio playback ---
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      console.log("Remote stream attached to audio element");
      // Try to play audio
      remoteAudioRef.current.play().catch(err => {
        console.warn("Could not autoplay audio:", err.message);
      });
    }
  }, [remoteStream]);

  // Show loading state while waiting for auth and socket
  if (isCheckingAuth || !authUser || !isConnected) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">
          {isCheckingAuth ? "Checking authentication..." : !authUser ? "Waiting for auth..." : "Connecting to server..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white relative overflow-hidden">
      {/* Hidden audio element for reliable audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      
      {/* --- Remote Video (Other person) --- */}
      <div
        className={isSwapped ? smallScreen : fullScreen}
        onClick={() => isSwapped && setIsSwapped(false)}
      >
        {/* Always render video element */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isSwapped ? "rounded-xl" : ""} ${(!remoteStream || !remoteHasVideo) ? "hidden" : ""}`}
        />
        {/* Show placeholder when no remote stream OR no video (audio-only call) */}
        {(!remoteStream || !remoteHasVideo) && (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 ${isSwapped ? "rounded-xl" : ""}`}>
            {remoteAvatarUrl ? (
              <img
                src={remoteAvatarUrl}
                alt={remoteName}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600 shadow-xl">
                <User size={48} className="text-gray-400" />
              </div>
            )}
            {!isSwapped && (
              <>
                <p className="mt-4 text-gray-400 text-lg">{getStatusText()}</p>
                {remoteStream && !remoteHasVideo && (
                  <p className="mt-2 text-gray-500 text-sm flex items-center gap-1">
                    <VideoOff size={14} /> Audio only
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {!isSwapped && (
          <div className="absolute top-5 left-5 z-10">
            <h2 className="text-2xl font-bold drop-shadow-lg">{remoteName}</h2>
            <p className={`text-sm ${callState.callStatus === "connected" ? "text-green-400" : "text-yellow-400"}`}>
              {getStatusText()}
            </p>
          </div>
        )}
      </div>

      {/* --- Local Video (You) --- */}
      <div
        className={isSwapped ? fullScreen : smallScreen}
        onClick={() => !isSwapped && setIsSwapped(true)}
      >
        {/* Always render video element but hide when camera is off or no video track */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isSwapped ? "rounded-xl" : ""} transform scale-x-[-1] ${(!localStream || !hasVideo || !isCamOn) ? "hidden" : ""}`}
        />
        {/* Show placeholder when camera is off or no video stream */}
        {(!localStream || !hasVideo || !isCamOn) && (
          <div className={`w-full h-full flex items-center justify-center bg-gray-700 ${!isSwapped ? "rounded-xl" : ""}`}>
            {authUser?.profilePic ? (
              <img
                src={authUser.profilePic}
                alt="You"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
        )}
        <div className={`absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs font-bold ${!isSwapped ? "" : "text-base"}`}>
          You {!isMicOn && "(Muted)"}
        </div>
      </div>

      {/* --- Status overlay for unavailable/busy/rejected --- */}
      {(callState.callStatus === "unavailable" || callState.callStatus === "busy" || callState.callStatus === "rejected") && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {callState.callStatus === "unavailable" ? "User is Offline" : 
               callState.callStatus === "busy" ? "User is Busy" : "Call Declined"}
            </p>
            <p className="text-gray-400 mt-2">Closing window...</p>
          </div>
        </div>
      )}

      {/* --- Control Bar --- */}
      <div className="absolute bottom-8 flex gap-4 px-6 py-4 bg-gray-900/60 backdrop-blur-xl rounded-full border border-gray-700 shadow-2xl z-40">
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-all ${
            isMicOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
          }`}
          title={isMicOn ? "Mute" : "Unmute"}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        {isVideoCall && (
          <button
            onClick={handleToggleCam}
            className={`p-4 rounded-full transition-all ${
              isCamOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
            }`}
            title={isCamOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
          title="End call"
        >
          <PhoneOff size={24} />
        </button>

        <button
          onClick={() => setIsSwapped(!isSwapped)}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
          title="Swap views"
        >
          <ArrowLeftRight size={24} />
        </button>
      </div>
    </div>
  );
}
