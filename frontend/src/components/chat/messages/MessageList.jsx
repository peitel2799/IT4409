import MessageBubble from "./MessageBubble";
import { useEffect, useRef, useMemo } from "react"; 
import { useChat } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthContext";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}


export default function MessageList({ chat }) {
  const messagesEndRef = useRef(null);
  const { authUser } = useAuth();
 
  const {
    messages,            // State tin nhắn từ context
    getMessagesByUserId, // Hàm gọi API tin nhắn
    isMessagesLoading    // State loading tin nhắn
  } = useChat();

  useEffect(() => {
    // Gọi hàm getMessages với chat._id (MongoDB ObjectId)
    getMessagesByUserId(chat?._id); 
    
  }, [chat, getMessagesByUserId]); 


  const groupedMessages = useMemo(() => {
    const groups = {};
    for (const msg of messages) { 
      // Sử dụng 'createdAt' thay vì 'time' (MongoDB timestamp)
      const dateKey = new Date(msg.createdAt || msg.time).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    }
    return groups;
  }, [messages]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); 

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <p className="text-gray-500">Loading messeage...</p>
      </div>
    );
  }
  
  if (!chat || !messages || messages.length === 0) {
     return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <p className="text-gray-500">Chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {Object.entries(groupedMessages).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="text-center my-4">
            <span className="text-xs text-yellow-800 bg-[#FAFDC6] rounded-full px-3 py-1">
              {formatDate(messages[0].createdAt || messages[0].time)}
            </span>
          </div>
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={{ 
                ...msg, 
                displayTime: formatTime(msg.createdAt || msg.time),
                isRead: msg.isRead 
              }}
              isMe={msg.senderId === authUser?._id || msg.senderId === 0} 
              avatar={chat.avatar || chat.profilePic}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}