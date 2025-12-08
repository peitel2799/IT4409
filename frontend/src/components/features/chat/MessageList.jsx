import { useEffect, useRef, useMemo } from "react";
import { useChat } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthContext";
import { LoaderIcon } from "lucide-react";
import MessageBubble from "./MessageBubble";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageList({ chat }) {
  const messagesEndRef = useRef(null);
  const { messages, getMessagesByUserId, isMessagesLoading } = useChat();
  const { authUser } = useAuth();

  useEffect(() => {
    if (chat?.id || chat?._id) getMessagesByUserId(chat.id || chat._id);
  }, [chat, getMessagesByUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    if (!messages) return groups;
    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

  if (isMessagesLoading) {
    return <div className="flex-1 flex items-center justify-center"><LoaderIcon className="w-8 h-8 animate-spin text-pink-300" /></div>;
  }

  if (!messages || messages.length === 0) {
    return <div className="flex-1 flex flex-col items-center justify-center text-gray-300 text-sm">No messages yet.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#FAFAFA] custom-scrollbar">
      {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
        <div key={dateKey}>
          <div className="flex justify-center mb-6 sticky top-0 z-0">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wide border border-gray-100">
              {formatDate(msgs[0].createdAt)}
            </span>
          </div>
          <div className="space-y-1">
            {msgs.map((msg) => (
              <MessageBubble
                key={msg._id || msg.id}
                message={{ ...msg, displayTime: formatTime(msg.createdAt) }}
                isMe={msg.senderId === authUser?._id}
                avatar={chat.avatar}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}