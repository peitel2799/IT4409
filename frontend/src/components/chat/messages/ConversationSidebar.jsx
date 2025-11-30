import { LoaderCircleIcon, Search, UserPlus } from "lucide-react";
import ConversationListItem from "./ConversationListItem";
import { useState, useEffect } from "react";
import { useChat } from "../../../context/ChatContext";
import { LoaderIcon } from "lucide-react";

export default function ConversationSidebar({
  selectedChat,
  onChatSelect,
}) {
  const [filter, setFilter] = useState("all");

  const {
    chats,
    getMyChatPartners,
    isUsersLoading
  } = useChat();


  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);
  useEffect(() => {
    if (!selectedChat && chats.length > 0 && !isUsersLoading) {
      onChatSelect(chats[0]);
    }
  }, [chats, isUsersLoading, selectedChat, onChatSelect]);

  const filteredChats = chats.filter((chat) => {
    if (filter === "unread") return chat.unread > 0;
    return true;
  });

  if (isUsersLoading && chats.length === 0) {
    return (
      <div className="flex flex-col w-80 bg-white border-r border-gray-200">
        <div className="flex-1 flex items-center justify-center">
          <LoaderIcon className="w-6 h-6 animate-spin text-pink-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-80 bg-white border-r border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-md p-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search ......"
            className="flex-1 ml-2 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-around mt-3">
          <button className="flex items-center text-sm text-gray-600 hover:text-[#6C63FF]">
            <UserPlus className="w-5 h-5 mr-1" />
            Add friends
          </button>
        </div>
      </div>

      <div className="flex p-3 border-b border-gray-200">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded-full ${filter === "all"
              ? "bg-[#FCE4EC] text-black font-semibold"
              : "text-gray-600"
            }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`ml-2 px-3 py-1 text-sm rounded-full ${filter === "unread"
              ? "bg-[#FCE4EC] text-black font-semibold"
              : "text-gray-600"
            }`}
        >
          Unread
        </button>
      </div>


      {/* Danh sách chat (Đã dùng filteredChats từ context) */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat, idx) => (
          <ConversationListItem
            key={chat.id || chat._id || idx}
            chat={chat}
            isActive={selectedChat?.id === chat.id || selectedChat?._id === chat._id}
            onClick={() => onChatSelect(chat)}
          />
        ))}
      </div>
    </div>
  );
}