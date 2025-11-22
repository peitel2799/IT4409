import { useState } from "react";
import { useChat } from "../../../context/ChatContext"; 
import ConversationSidebar from "./ConversationSidebar";
import ChatArea from "./ChatArea";
import InfoSidebar from "./InfoSidebar";

export default function ChatDashboard() {
  const { selectedUser, setSelectedUser } = useChat(); 
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(true);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm relative">
      {/* Sidebar: Ẩn trên mobile nếu đã chọn user */}
      <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-80 h-full flex-shrink-0 border-r border-gray-50`}>
        <ConversationSidebar selectedChat={selectedUser} onChatSelect={setSelectedUser} />
      </div>
      
      {/* Chat Area: Ẩn trên mobile nếu chưa chọn user */}
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 h-full min-w-0`}>
        <ChatArea 
          chat={selectedUser} 
          onToggleInfoSidebar={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)} 
          isInfoSidebarOpen={isInfoSidebarOpen}
        />
      </div>

      {/* Info Sidebar: Trên mobile sẽ là overlay fixed, desktop là hidden xl:block */}
      {isInfoSidebarOpen && selectedUser && (
        <>
          {/* Overlay cho mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 xl:hidden" 
            onClick={() => setIsInfoSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-[280px] z-50 xl:relative xl:w-80 h-full flex-shrink-0 border-l border-gray-50 bg-white shadow-xl xl:shadow-none">
              <InfoSidebar chat={selectedUser} onClose={() => setIsInfoSidebarOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}