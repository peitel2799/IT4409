import { useState } from "react";
import { useChat } from "../../../context/ChatContext"; 
import ConversationSidebar from "./ConversationSidebar";
import ChatArea from "./ChatArea";
import InfoSidebar from "./InfoSidebar";

export default function ChatDashboard() {
  const { selectedUser, setSelectedUser } = useChat(); 
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(true);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="w-80 h-full flex-shrink-0 border-r border-gray-50">
        <ConversationSidebar selectedChat={selectedUser} onChatSelect={setSelectedUser} />
      </div>
      
      <div className="flex-1 h-full min-w-0">
        <ChatArea 
          chat={selectedUser} 
          onToggleInfoSidebar={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)} 
          isInfoSidebarOpen={isInfoSidebarOpen}
        />
      </div>

      {isInfoSidebarOpen && selectedUser && (
        <div className="w-80 h-full flex-shrink-0 hidden xl:block border-l border-gray-50">
            <InfoSidebar chat={selectedUser} onClose={() => setIsInfoSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
}