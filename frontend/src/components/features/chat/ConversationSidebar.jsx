import { useState, useEffect } from "react";
import { useChat } from "../../../context/ChatContext";
import SidebarHeader from "./SidebarHeader";
import ConversationItem from "./ConversationItem";

export default function ConversationSidebar({ selectedChat, onChatSelect }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); 
  const { homeStats, getHomeStats } = useChat();

  const chats = homeStats?.chats || [];

  useEffect(() => {
    getHomeStats();
  }, [getHomeStats]);

  // Logic lọc danh sách
  const filteredChats = chats.filter((chat) => {
    //Lọc theo tab 
    const matchesFilter = filter === "unread" ? chat.unreadCount > 0 : true;

    //Lọc theo từ khóa tìm kiếm 
    const searchLow = searchQuery.toLowerCase();
    const keySearch = chat.name.toLowerCase().includes(searchLow) || (chat.lastMessage || "").toLowerCase().includes(searchLow);

    return matchesFilter && keySearch;
  });

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <SidebarHeader 
        filter={filter} 
        setFilter={setFilter} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto pt-2 pb-4 custom-scrollbar">
        {filteredChats.map((chat) => (
          <ConversationItem
            key={chat._id}
            chat={chat}
            isActive={selectedChat?._id === chat._id}
            onClick={() => {
              onChatSelect(chat);
              setSearchQuery(""); // Xóa từ khóa tìm kiếm khi chọn hội thoại
            }}
          />
        ))}
        {filteredChats.length === 0 && (
          <div className="text-center text-gray-400 text-xs mt-10">
            {searchQuery ? "No results" : "No conversations"}
          </div>
        )}
      </div>
    </div>
  );
}