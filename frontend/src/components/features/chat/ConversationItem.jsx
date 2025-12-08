import { useSocket } from "../../../context/SocketContext";
import { Cloud } from "lucide-react";

export default function ConversationItem({ chat, isActive, onClick }) {
  const { onlineUsers } = useSocket();

  // Check if this is My Cloud (self-chat)
  const isSelfChat = chat.isSelfChat;

  // Check if this chat partner is online (My Cloud is always available)
  const isOnline = isSelfChat || onlineUsers.includes(chat.id) || chat.isOnline;

  // Get avatar with fallback
  const avatarUrl = chat.avatar || chat.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name || 'U')}`;

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer transition-all rounded-xl mx-2 mb-1 ${isActive
          ? isSelfChat
            ? "bg-blue-50 border border-blue-100"
            : "bg-pink-50 border border-pink-100"
          : "hover:bg-gray-50 border border-transparent"
        }`}
    >
      <div className="relative">
        {isSelfChat ? (
          // Special cloud avatar for My Cloud
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center border border-blue-200">
            <Cloud size={24} className="text-white" />
          </div>
        ) : (
          <img src={avatarUrl} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
        )}
        {isOnline && !isSelfChat && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex justify-between items-baseline">
          <p className={`font-semibold text-sm truncate ${isActive
              ? isSelfChat ? "text-blue-700" : "text-pink-700"
              : "text-gray-800"
            }`}>
            {chat.name}
          </p>
          <span className="text-[10px] text-gray-400">{chat.time}</span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className={`text-xs truncate max-w-[140px] ${isActive
              ? isSelfChat ? "text-blue-400 font-medium" : "text-pink-400 font-medium"
              : "text-gray-500"
            }`}>
            {isSelfChat ? (chat.lastMessage || "Save notes & files here") : chat.lastMessage}
          </p>
          {chat.unread > 0 && (
            <span className={`flex items-center justify-center text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 ${isSelfChat ? "bg-blue-500" : "bg-pink-500"
              }`}>
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}