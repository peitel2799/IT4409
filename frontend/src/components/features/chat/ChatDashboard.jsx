import { useState } from "react";
import { useChat } from "../../../context/ChatContext";
import { useGroup } from "../../../context/GroupContext";
import { useState, useCallback, useRef } from "react";
import { useChat } from "../../../context/ChatContext";
import ConversationSidebar from "./ConversationSidebar";
import ChatArea from "./ChatArea";
import GroupChatArea from "./GroupChatArea";
import InfoSidebar from "./InfoSidebar";
import GroupInfoSidebar from "./GroupInfoSidebar";

export default function ChatDashboard() {
  const { selectedUser, setSelectedUser } = useChat();
  const { selectedGroup, setSelectedGroup } = useGroup();
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);

  // Determine if we have an active chat (either private or group)
  const hasActiveChat = selectedUser || selectedGroup;

  return (
    <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm relative">
      {/* Sidebar - Hidden when chat selected on mobile, always visible on md+ */}
      <div
        className={`${
          hasActiveChat ? "hidden" : "flex"
        } md:flex w-full md:w-80 h-full flex-shrink-0 border-r border-gray-50`}
      >
        <ConversationSidebar
          selectedChat={selectedUser}
          onChatSelect={setSelectedUser}
          selectedGroup={selectedGroup}
          onGroupSelect={setSelectedGroup}
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const [pendingHighlightMessageId, setPendingHighlightMessageId] = useState(null);
  const chatAreaRef = useRef(null);

  // Handle message highlight from sidebar search
  const handleHighlightMessage = useCallback((messageId) => {
    setPendingHighlightMessageId(messageId);
  }, []);

  // Clear pending highlight after ChatArea processes it
  const handleHighlightProcessed = useCallback(() => {
    setPendingHighlightMessageId(null);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm relative">
      {/* Sidebar Ẩn khi đã chọn user trên mobile, luôn hiện trên md */}
      <div className={`${selectedUser ? "hidden" : "flex"} md:flex w-full md:w-80 h-full flex-shrink-0 border-r border-gray-50`}>
        <ConversationSidebar
          selectedChat={selectedUser}
          onChatSelect={setSelectedUser}
          onHighlightMessage={handleHighlightMessage}
        />
      </div>

      {/* Chat Area Hiện khi đã chọn user trên mobile, luôn hiện trên md */}
      <div className={`${selectedUser ? "flex" : "hidden"} md:flex flex-1 h-full min-w-0`}>
        <ChatArea
          ref={chatAreaRef}
          chat={selectedUser}
          onToggleInfoSidebar={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)}
          isInfoSidebarOpen={isInfoSidebarOpen}
          externalHighlightMessageId={pendingHighlightMessageId}
          onHighlightProcessed={handleHighlightProcessed}
        />
      </div>

      {/* Chat Area - Visible when chat selected on mobile, always visible on md+ */}
      <div
        className={`${
          hasActiveChat ? "flex" : "hidden"
        } md:flex flex-1 h-full min-w-0`}
      >
        {selectedGroup ? (
          // Group Chat
          <GroupChatArea
            group={selectedGroup}
            onToggleInfoSidebar={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)}
            isInfoSidebarOpen={isInfoSidebarOpen}
          />
        ) : (
          // Private Chat
          <ChatArea
            chat={selectedUser}
            onToggleInfoSidebar={() => setIsInfoSidebarOpen(!isInfoSidebarOpen)}
            isInfoSidebarOpen={isInfoSidebarOpen}
          />
        )}
      </div>

      {/* Info Sidebar */}
      {isInfoSidebarOpen && hasActiveChat && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 xl:hidden"
            onClick={() => setIsInfoSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-[280px] z-50 xl:relative xl:w-80 h-full flex-shrink-0 border-l border-gray-50 bg-white shadow-xl xl:shadow-none">
            {selectedGroup ? (
              <GroupInfoSidebar
                group={selectedGroup}
                onClose={() => setIsInfoSidebarOpen(false)}
              />
            ) : (
              <InfoSidebar
                chat={selectedUser}
                onClose={() => setIsInfoSidebarOpen(false)}
              />
            )}
            <InfoSidebar chat={selectedUser} onClose={() => setIsInfoSidebarOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
