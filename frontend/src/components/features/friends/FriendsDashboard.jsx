import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useChat } from "../../../context/ChatContext";

import FriendsSidebar from "./FriendsSidebar";
import RightSidebar from "./RightSidebar";
import FriendsHeader from "./FriendsHeader";
import AddFriendButton from "./AddFriendButton"; // Import nút mới

export default function FriendsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedUser } = useChat(); // Nếu cần dùng cho RightSidebar
  
  // State giao diện chung
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStartChat = (friend) => {
    setSelectedUser(friend);
    navigate("/chat/messages");
  };

  // Xác định tiêu đề dựa trên URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("online")) return "Online Friends";
    if (path.includes("requests")) return "Friend Requests";
    if (path.includes("sent")) return "Sent Requests";
    return "All Friends";
  };

  return (
    <div className="flex h-full w-full bg-[#FAFAFA]">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 h-full flex-shrink-0 hidden md:block">
        <FriendsSidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-full min-w-0 flex flex-col relative">
        <FriendsHeader 
            title={getPageTitle()}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            showSearch={true}
            showToggle={true}
        />
        
        <div className="flex-1 overflow-hidden p-6 relative">
             {/* 
                Outlet là nơi các component con (FriendsList, SentRequests) 
                sẽ được render tùy theo Route.
                Ta truyền context để con nhận được search & viewMode.
             */}
             <Outlet context={{ searchQuery, viewMode, onStartChat: handleStartChat }} />

             {/* Nút Add Friend nằm đè lên mọi tab */}
             <AddFriendButton />
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-72 h-full flex-shrink-0 hidden xl:block">
         <RightSidebar onStartChat={handleStartChat} />
      </div>
    </div>
  );
}