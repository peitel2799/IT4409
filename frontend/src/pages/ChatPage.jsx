import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import NavigationSidebar from "../components/chat/NavigationSidebar";
import ConversationSidebar from "../components/chat/messages/ConversationSidebar";
import ChatArea from "../components/chat/messages/ChatArea";
import InfoSidebar from "../components/chat/messages/InfoSidebar";
import FriendsList from "../components/chat/contact/FriendsList"; 

import SettingsSidebar from "../components/chat/settings/SettingsSidebar";
import SettingsDetail from "../components/chat//SettingsDetail";

export default function ChatPage() {
  const { authUser, isCheckingAuth } = useAuth();
  const navigate = useNavigate();

  const [selectedChat, setSelectedChat] = useState(null); 
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(true);

  // 'chats', 'friends', 'settings'
  const [activePanel, setActivePanel] = useState("chats");

  // ... (useEffect và check loading/auth ) ...
  useEffect(() => {
    if (!isCheckingAuth && !authUser) {
      navigate("/login", { replace: true });
    }
  }, [authUser, isCheckingAuth, navigate]);

  if (isCheckingAuth) { /* ... loading ... */ }
  if (!authUser) { /* ... chuyển hướng ... */ }

  const handleSelectChatFromFriends = (chat) => {
    setSelectedChat(chat);
    setActivePanel("chats"); 
  };

  //render các cột sidebar
  const renderPanel = () => {
    switch (activePanel) {
      case "friends":
        return (
          <FriendsList 
            onChatSelect={handleSelectChatFromFriends}
          />
        );
      case "settings":
        return (
          <SettingsSidebar/>
        );
      case "chats":
      default:
        return (
          <ConversationSidebar
            selectedChat={selectedChat}
            onChatSelect={setSelectedChat}
          />
        );
    }
  };

  // render phần chính  nội dung chat 
  const renderMain = () => {
    if (activePanel === "settings") {
      return <SettingsDetail />;
    }
    // Khi ở 'chats' hoặc 'friends', vẫn hiển thị ChatArea
    return (
      <ChatArea
        chat={selectedChat}
        onToggleInfoSidebar={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)}
        isInfoSidebarOpen={isInfoSidebarOpen}
      />
    );
  };
  
  // reder phần thông tin 
  const renderInfo = () => {
    // Ẩn InfoSidebar khi đang ở màn hình Settings
    if (activePanel === "settings") {
      return null;
    }
    
    return isInfoSidebarOpen && selectedChat && (
      <InfoSidebar 
        chat={selectedChat} 
        onClose={() => setIsInfoSidebarOpen(false)}
      />
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      
      <NavigationSidebar 
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />
      
      {/* GỌI CÁC HÀM RENDER */}
      {renderPanel()}
      {renderMain()}
      {renderInfo()}
      
    </div>
  );
}