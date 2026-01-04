import { ChevronLeft, Cloud, Phone, Search, Sidebar, Video } from "lucide-react";
import { OpenCallWindow } from "../../../../utils/window";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/ChatContext";
import { useFriend } from "../../../context/FriendContext";
import { useSocket } from "../../../context/SocketContext";

export default function ChatHeader({
  chat,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
  onToggleSearch,
  isSearchOpen,
}) {
  const { onlineUsers, socket } = useSocket();
  const { authUser } = useAuth();
  const { setSelectedUser } = useChat();
  const { friends } = useFriend();

  //kiểm tra có phải bạn bè không
  const isFriend = friends.some(f => f._id === chat?._id);
  if (!chat) return null;

  const isSelfChat = chat.isSelfChat || chat._id === authUser?._id;
  const isOnline = isSelfChat || (Array.isArray(onlineUsers) && (onlineUsers.includes(chat.id) || onlineUsers.includes(chat._id))) || chat.isOnline;

  const avatarUrl = chat.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.fullName || "U")}&background=random`;

  const handleStartCall = (isVideo) => {
    if (!socket || !authUser || isSelfChat) return;
    const receiverId = chat.id || chat._id;
    socket.emit("call:initiate", {
      receiverId,
      callerInfo: { id: authUser._id, name: authUser.fullName, avatar: authUser.profilePic },
      isVideo,
    });
    OpenCallWindow({ name: chat.fullName, avatar: avatarUrl, id: receiverId, video: isVideo ? "true" : "false", caller: "true" });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={() => setSelectedUser(null)} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>

        {isSelfChat ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center border shadow-sm flex-shrink-0">
            <Cloud size={20} className="text-white" />
          </div>
        ) : (
          <img src={avatarUrl} alt={chat.fullName} className="w-10 h-10 rounded-full border object-cover" />
        )}

        <div>
          <h3 className="font-bold text-sm text-gray-800">
            {chat.fullName} {isSelfChat && <span className="text-blue-500 text-[10px] ml-1 font-medium">(My Cloud)</span>}
          </h3>
          {!isSelfChat && (
            <p className={`text-xs flex items-center gap-1 ${isOnline ? "text-green-500" : "text-gray-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-300"}`}></span>
              {isOnline ? "Online" : "Offline"}
            </p>)}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSearch}
          className={`p-2 rounded-xl transition-colors ${isSearchOpen ? "bg-pink-50 text-pink-500" : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"}`}
        >
          <Search size={20} />
        </button>


        <>
          {!isSelfChat && isFriend && (
            <>
              <button onClick={() => handleStartCall(false)} className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl" title="Voice Call">
                <Phone size={20} />
              </button>
              <button onClick={() => handleStartCall(true)} className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl" title="Video Call">
                <Video size={20} />
              </button>
            </>
          )}

          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button
            onClick={onToggleInfoSidebar}
            className={`p-2 rounded-xl ${isInfoSidebarOpen ? "bg-pink-50 text-pink-500" : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"}`}
          >
            <Sidebar size={20} />
          </button>
        </>

      </div>
    </div>
  );
}