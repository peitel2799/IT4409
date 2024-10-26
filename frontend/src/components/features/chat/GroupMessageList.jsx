import { LoaderIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useGroup } from "../../../context/GroupContext";
import GroupMessageBubble from "./GroupMessageBubble";

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
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  const names = users.map((u) => u.fullName || "Someone").join(", ");
  const isPlural = users.length > 1;

  return (
    <div className="flex items-end mb-2 gap-2">
      <div className="bg-white border border-gray-100 rounded-[20px] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
          <span className="text-xs text-gray-400">
            {names} {isPlural ? "are" : "is"} typing...
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GroupMessageList({ group }) {
  const messagesEndRef = useRef(null);
  const {
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    typingUsers,
  } = useGroup();
  const { authUser } = useAuth();

  const groupId = group?._id;
  const groupTypingUsers = typingUsers[groupId] || [];

  useEffect(() => {
    if (groupId) getGroupMessages(groupId);
  }, [groupId, getGroupMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages, groupTypingUsers]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    if (!groupMessages) return groups;
    groupMessages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [groupMessages]);

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoaderIcon className="w-8 h-8 animate-spin text-indigo-300" />
      </div>
    );
  }

  if (!groupMessages || groupMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 text-sm relative">
        <p>No messages yet. Start the conversation!</p>
        {groupTypingUsers.length > 0 && (
          <div className="absolute bottom-4 left-4">
            <TypingIndicator users={groupTypingUsers} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#FAFAFA] custom-scrollbar">
      {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
        <div key={dateKey}>
          {/* Date Header */}
          <div className="flex justify-center mb-6 sticky top-0 z-0">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wide border border-gray-100">
              {formatDate(msgs[0].createdAt)}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-1">
            {msgs.map((msg, index) => {
              const senderId = msg.senderId?._id || msg.senderId;
              const isMe = senderId === authUser?._id;
              const senderInfo = msg.senderId;

              const getFallbackAvatar = (name) =>
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  name || "U"
                )}&background=random`;

              const messageAvatar = isMe
                ? authUser?.profilePic || getFallbackAvatar(authUser?.fullName)
                : senderInfo?.profilePic ||
                  getFallbackAvatar(senderInfo?.fullName);

              const senderName = isMe
                ? "You"
                : senderInfo?.fullName || "Unknown";

              // Check if this is the first message from this sender in a consecutive group
              const prevMsg = msgs[index - 1];
              const prevSenderId = prevMsg?.senderId?._id || prevMsg?.senderId;
              const isFirstInGroup = prevSenderId !== senderId;

              // Check if this is the last message from this sender
              const nextMsg = msgs[index + 1];
              const nextSenderId = nextMsg?.senderId?._id || nextMsg?.senderId;
              const isLastInGroup = nextSenderId !== senderId;

              return (
                <GroupMessageBubble
                  key={msg._id || msg.id}
                  message={{ ...msg, displayTime: formatTime(msg.createdAt) }}
                  isMe={isMe}
                  avatar={messageAvatar}
                  senderName={senderName}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
          </div>
        </div>
      ))}

      {groupTypingUsers.length > 0 && (
        <TypingIndicator users={groupTypingUsers} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

