import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatArea({ chat, onToggleInfoSidebar, isInfoSidebarOpen }) {
  // Nếu không có chat nào được chọn
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white">
        <p className="text-gray-500">
          Chosse a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header của khung chat */}
      <ChatHeader 
        chat={chat} 
        onToggleInfoSidebar={onToggleInfoSidebar}
        isInfoSidebarOpen={isInfoSidebarOpen}
      />
      
      {/* Danh sách tin nhắn */}
      <MessageList chat={chat} />
      
      {/* Khung nhập*/}
      <ChatInput />
    </div>
  );
}