import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeftRight } from "lucide-react";

// Video giả lập người bên kia
const REMOTE_VIDEO_MOCK_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

export default function CallPage() {
  // --- Lấy thông tin từ URL ---
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "Remote";
  const videoEnabled = searchParams.get("video") === "true";
  const avatar = searchParams.get("avatar");

  // --- State ---
  const [isMicOn, setIsMicOn] = useState(true);         // Mic bật/tắt
  const [isCamOn, setIsCamOn] = useState(videoEnabled); // Cam bật/tắt
  const [status, setStatus] = useState("Connecting...");// Trạng thái call
  const [isSwapped, setIsSwapped] = useState(false);    // Đổi video lớn/nhỏ
  const [localStream, setLocalStream] = useState(null); // Stream của mình
  

  // --- Ref video ---
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // --- Lấy camera + mic ---
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setStatus("Connected");

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Không thể truy cập camera/mic:", err);
        setStatus("Access Denied");
      }
    }
    startMedia();

    // Cleanup: stop camera khi đóng page
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- Điều khiển bật/tắt Mic + Cam ---
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = isMicOn);
      localStream.getVideoTracks().forEach(track => track.enabled = isCamOn);
    }
  }, [isMicOn, isCamOn, localStream]);

  // --- Kết thúc cuộc gọi ---
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    window.close();
  };

  // --- CSS cho màn hình ---
  const fullScreen = `
  absolute inset-0 w-full h-full
  object-cover z-0
`;

const smallScreen = `
  absolute top-5 right-5
  w-48 h-64
  bg-gray rounded-xl border border-white/20
  shadow-2xl
  cursor-pointer overflow-hidden
  z-20
`;

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white relative">

      {/* --- Local Video (Của mình) --- */}
      <div
        className={isSwapped ? fullScreen : smallScreen}
        onClick={() => !isSwapped && setIsSwapped(true)}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isSwapped ? "rounded-xl" : ""} transform scale-x-[-1]`}
        />
        {!isCamOn && <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-xs">{avatar}</div>}
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs font-bold">
          You {isMicOn ? "" : "(Muted)"}
        </div>
      </div>

      {/* --- Remote Video (Người kia) --- */}
      <div
        className={isSwapped ? smallScreen : fullScreen}
        onClick={() => isSwapped && setIsSwapped(false)}
      >
        <video
          ref={remoteVideoRef}
          src={REMOTE_VIDEO_MOCK_URL}
          autoPlay
          loop
          muted={false}
          className={`w-full h-full object-cover ${isSwapped ? "rounded-xl" : ""}`}
        />
        <div className="absolute top-5 left-5">
          <h2 className={`${isSwapped ? "text-sm" : "text-2xl"} font-bold`}>{name}</h2>
          <p className="text-green-400 text-sm">{status}</p>
        </div>
      </div>

      {/* --- Control Bar --- */}
      <div className="absolute bottom-8 flex gap-4 px-6 py-4 bg-gray-900/60 backdrop-blur-xl rounded-full border border-gray-700 shadow-2xl">
        <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-full ${isMicOn ? "bg-gray-700" : "bg-pink-400"}`}>
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button onClick={() => setIsCamOn(!isCamOn)} className={`p-4 rounded-full ${isCamOn ? "bg-gray-700" : "bg-pink-400"}`}>
          {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button onClick={handleEndCall} className="p-4 rounded-full bg-pink-400">
          <PhoneOff size={24} fill="white" />
        </button>
        <button onClick={() => setIsSwapped(!isSwapped)} className="p-4 rounded-full bg-gray-700">
          <ArrowLeftRight size={24} />
        </button>
      </div>

    </div>
  );
}
