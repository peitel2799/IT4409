import { useState, useEffect } from "react";
import { useChat } from "../../../context/ChatContext";
import SidebarHeader from "./SidebarHeader";
import ConversationItem from "./ConversationItem";

export default function ConversationSidebar({ selectedChat, onChatSelect }) {
  const [filter, setFilter] = useState("all");
  const { homeStats, getHomeStats } = useChat();

  const chats = homeStats?.chats || [];

  useEffect(() => {
    getHomeStats();
  }, [getHomeStats]);

  const filteredChats = chats.filter((chat) => {
    if (filter === "unread") return chat.unread > 0;
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <SidebarHeader filter={filter} setFilter={setFilter} />

      <div className="flex-1 overflow-y-auto pt-2 pb-4 custom-scrollbar">
        {filteredChats.map((chat) => (
          <ConversationItem
            key={chat.id}
            chat={chat}
            isActive={selectedChat?.id === chat.id}
            onClick={() => onChatSelect(chat)}
          />
        ))}
        {filteredChats.length === 0 && (
          <div className="text-center text-gray-400 text-xs mt-10">No conversations</div>
        )}
      </div>
    </div>
  );
}