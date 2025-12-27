import { Phone, Video, Sidebar, ChevronLeft } from "lucide-react";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/ChatContext";

export default function ChatHeader({
  chat,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
}) {
  const { onlineUsers, socket } = useSocket();
  const { authUser } = useAuth();
  const { setSelectedUser } = useChat();

  if (!chat) return null; // tránh lỗi khi chat chưa có dữ liệu

  // Check if this chat partner is online
  const isOnline =
    (Array.isArray(onlineUsers) &&
      (onlineUsers.includes(chat.id) || onlineUsers.includes(chat._id))) ||
    chat.isOnline;

  // Get avatar with fallback
  const avatarUrl =
    chat.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      chat.fullName || "U"
    )}&background=random`;

  // Handle starting a call - emit from main window, then open call window
  const handleStartCall = (isVideo) => {
    if (!socket || !authUser) return;

    const receiverId = chat.id || chat._id;

    // Check if receiver is online
    if (!onlineUsers.includes(receiverId)) {
      alert("User is offline. Cannot start call.");
      return;
    }

    // Emit call:initiate from main window
    socket.emit("call:initiate", {
      receiverId,
      callerInfo: {
        id: authUser._id,
        name: authUser.fullName,
        avatar: authUser.profilePic,
      },
      isVideo,
    });

    // Open call window
    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const params = new URLSearchParams({
      name: chat.fullName,
      avatar: avatarUrl,
      id: receiverId,
      video: isVideo ? "true" : "false",
      caller: "true",
    });

    window.open(
      `/call-window?${params.toString()}`,
      "_blank",
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      {/* Back button + Avatar gần nhau */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        <img
          src={avatarUrl}
          alt={chat.fullName}
          className="w-10 h-10 rounded-full border object-cover"
        />
        <div>
          <h3 className="font-bold text-sm text-gray-800 group-hover:text-pink-600">
            {chat.fullName}
          </h3>
          <p
            className={`text-xs flex items-center gap-1 ${
              isOnline ? "text-green-500" : "text-gray-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-300"
              }`}
            ></span>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleStartCall(false)}
          className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl"
          title="Voice Call"
        >
          <Phone size={20} />
        </button>
        <button
          onClick={() => handleStartCall(true)}
          className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl"
          title="Video Call"
        >
          <Video size={20} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <button
          onClick={onToggleInfoSidebar}
          className={`p-2 rounded-xl ${
            isInfoSidebarOpen
              ? "bg-pink-50 text-pink-500"
              : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          <Sidebar size={20} />
        </button>
      </div>
    </div>
  );
}
