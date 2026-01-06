import { ChevronLeft, Cloud, Phone, Search, Sidebar, Video, MoreVertical, ShieldAlert, ShieldOff } from "lucide-react";
import { OpenCallWindow } from "../../../utils/window";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/ChatContext";
import { useFriend } from "../../../context/FriendContext";
import { useSocket } from "../../../context/SocketContext";
import { useBlock } from "../../../context/BlockContext";
import { useState, useRef, useEffect } from "react";

export default function ChatHeader({
  chat,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
  onToggleSearch,
  isSearchOpen,
}) {
  const { onlineUsers, socket } = useSocket();
  const { authUser } = useAuth();
  const { setSelectedUser, getHomeStats } = useChat();
  const { friends } = useFriend();
  const { isUserBlocked, isUserSpammed, blockUser, unblockUser, spamUser, unspamUser } = useBlock();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  //kiểm tra có phải bạn bè không
  const isFriend = friends.some(f => f._id === chat?._id);
  if (!chat) return null;

  const isSelfChat = chat.isSelfChat || chat._id === authUser?._id;
  const isOnline = isSelfChat || (Array.isArray(onlineUsers) && (onlineUsers.includes(chat.id) || onlineUsers.includes(chat._id))) || chat.isOnline;
  const isBlocked = isUserBlocked(chat?._id);
  const isSpammed = isUserSpammed(chat?._id);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlockUser = async () => {
    if (isBlocked) {
      await unblockUser(chat._id);
    } else {
      await blockUser(chat._id);
    }
    setIsMenuOpen(false);
    getHomeStats(); // Refresh conversation list
  };

  const handleSpamUser = async () => {
    if (isSpammed) {
      await unspamUser(chat._id);
    } else {
      await spamUser(chat._id);
    }
    setIsMenuOpen(false);
    getHomeStats(); // Refresh conversation list
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
            {isSelfChat ? "Cloud" : chat.fullName}
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

          {!isSelfChat && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100"
                title="More options"
              >
                <MoreVertical size={20} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleBlockUser}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <ShieldOff size={16} className={isBlocked ? "text-green-600" : "text-red-600"} />
                    <span className={isBlocked ? "text-green-700" : "text-red-700"}>
                      {isBlocked ? "Unblock User" : "Block User"}
                    </span>
                  </button>
                  <button
                    onClick={handleSpamUser}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <ShieldAlert size={16} className={isSpammed ? "text-green-600" : "text-orange-600"} />
                    <span className={isSpammed ? "text-green-700" : "text-orange-700"}>
                      {isSpammed ? "Unmark as Spam" : "Mark as Spam"}
                    </span>
                  </button>
                </div>
              )}
            </div>
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