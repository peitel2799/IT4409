import { Phone, Video, Sidebar, Cloud, HardDrive } from "lucide-react";
import { useSocket } from "../../../context/SocketContext";
import { useCall } from "../../../context/CallContext";
import { useAuth } from "../../../context/AuthContext";

export default function ChatHeader({ chat, onToggleInfoSidebar, isInfoSidebarOpen }) {
  const { onlineUsers, socket } = useSocket();
  const { authUser } = useAuth();
  const { setCallState, getUserMedia, localStream } = useCall();

  // Check if this is My Cloud (self-chat)
  const isSelfChat = chat.isSelfChat;

  // Check if this chat partner is online (My Cloud is always available)
  const isOnline = isSelfChat || onlineUsers.includes(chat.id) || onlineUsers.includes(chat._id) || chat.isOnline;

  // Get avatar with fallback
  const avatarUrl = chat.avatar || chat.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name || 'U')}`;

  // Handle starting a call - emit from main window, then open call window
  const handleStartCall = async (isVideo) => {
    if (isSelfChat) return; // Can't call yourself

    const receiverId = chat.id || chat._id;
    
    // Check if socket is connected
    if (!socket || !authUser) {
      console.error("Socket not connected or user not authenticated");
      return;
    }

    // Check if receiver is online
    if (!onlineUsers.includes(receiverId)) {
      alert("User is offline. Cannot start call.");
      return;
    }

    console.log("=== Starting call from ChatHeader ===");
    console.log("Receiver:", receiverId);
    console.log("Socket connected:", socket.connected);

    // Emit call:initiate from main window (where socket is already connected)
    socket.emit("call:initiate", {
      receiverId,
      callerInfo: {
        id: authUser._id,
        name: authUser.fullName,
        avatar: authUser.profilePic,
      },
      isVideo,
    });

    console.log("call:initiate emitted from main window");

    // Open call window
    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const params = new URLSearchParams({
      name: chat.name,
      avatar: avatarUrl,
      id: receiverId,
      video: isVideo ? "true" : "false",
      caller: "true", // Mark this as caller window
    });

    window.open(
      `/call-window?${params.toString()}`,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );
  };

  return (
    <div className={`flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 ${isSelfChat ? "border-blue-100" : "border-gray-100"
      }`}>
      <div className="flex items-center gap-3 cursor-pointer group">
        {isSelfChat ? (
          // Special cloud avatar for My Cloud
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center border border-blue-200">
            <Cloud size={20} className="text-white" />
          </div>
        ) : (
          <img src={avatarUrl} alt={chat.name} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm transition-colors ${isSelfChat
                ? "text-blue-700 group-hover:text-blue-800"
                : "text-gray-800 group-hover:text-pink-600"
              }`}>
              {chat.name}
            </h3>
            {isSelfChat && <HardDrive size={12} className="text-blue-400" />}
          </div>
          <p className={`text-xs font-medium flex items-center gap-1 ${isSelfChat ? 'text-blue-500' : (isOnline ? 'text-green-500' : 'text-gray-400')
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSelfChat ? 'bg-blue-500' : (isOnline ? 'bg-green-500' : 'bg-gray-300')
              }`}></span>
            {isSelfChat ? 'Save notes & files' : (isOnline ? 'Online' : 'Offline')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!isSelfChat && (
          <>
            {/* Voice Call Button */}
            <button
              onClick={() => handleStartCall(false)}
              className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
              title="Voice Call"
            >
              <Phone size={20} />
            </button>

            {/* Video Call Button */}
            <button
              onClick={() => handleStartCall(true)}
              className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
              title="Video Call"
            >
              <Video size={20} />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>
          </>
        )}

        <button
          onClick={onToggleInfoSidebar}
          className={`p-2 rounded-xl transition-all ${isInfoSidebarOpen
              ? isSelfChat ? "bg-blue-50 text-blue-500" : "bg-pink-50 text-pink-500"
              : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
            }`}
        >
          <Sidebar size={20} />
        </button>
      </div>
    </div>
  );
}