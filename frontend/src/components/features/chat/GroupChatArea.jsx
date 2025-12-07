import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Users, Send, Image, X, LogOut } from "lucide-react";
import { useGroup } from "../../../context/GroupContext";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import toast from "react-hot-toast";

export default function GroupChatArea({ onBack }) {
  const { authUser } = useAuth();
  const { socket } = useSocket();
  const {
    selectedGroup,
    groupMessages,
    isLoadingMessages,
    sendGroupMessage,
    leaveGroup,
    clearSelectedGroup,
  } = useGroup();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    let typingTimeout;
    if (text) {
      socket.emit("group:typing", { groupId: selectedGroup._id });
      typingTimeout = setTimeout(() => {
        socket.emit("group:stop-typing", { groupId: selectedGroup._id });
      }, 2000);
    }

    return () => {
      clearTimeout(typingTimeout);
      if (socket && selectedGroup) {
        socket.emit("group:stop-typing", { groupId: selectedGroup._id });
      }
    };
  }, [text, socket, selectedGroup]);

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Chọn một nhóm để bắt đầu trò chuyện</p>
        </div>
      </div>
    );
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh phải nhỏ hơn 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !image) || isSending) return;

    setIsSending(true);
    try {
      await sendGroupMessage(selectedGroup._id, text.trim(), image);
      setText("");
      removeImage();
    } catch (error) {
      toast.error("Lỗi khi gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Bạn có chắc muốn rời khỏi nhóm này?")) return;

    setIsLeaving(true);
    try {
      await leaveGroup(selectedGroup._id);
      toast.success("Đã rời khỏi nhóm");
      onBack?.();
    } catch (error) {
      toast.error("Lỗi khi rời nhóm");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleBack = () => {
    clearSelectedGroup();
    onBack?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <button
          onClick={handleBack}
          className="md:hidden p-1 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <Users size={18} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-800 truncate">
            {selectedGroup.name}
          </h2>
          <p className="text-xs text-gray-500">
            {selectedGroup.members?.length || 0} thành viên
          </p>
        </div>

        <button
          onClick={handleLeaveGroup}
          disabled={isLeaving}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Rời nhóm"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : groupMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          groupMessages.map((message) => {
            const isOwn =
              message.senderId._id === authUser._id ||
              message.senderId === authUser._id;
            const senderName =
              message.senderId.fullName || message.senderId.email || "Unknown";
            const senderAvatar =
              message.senderId.profilePic ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                senderName
              )}&background=random`;

            return (
              <div
                key={message._id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {!isOwn && (
                  <img
                    src={senderAvatar}
                    alt={senderName}
                    className="w-8 h-8 rounded-full object-cover self-end"
                  />
                )}
                <div
                  className={`max-w-[70%] ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                      {senderName}
                    </p>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-purple-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="attachment"
                        className="max-w-full rounded-lg mb-1"
                      />
                    )}
                    {message.text && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    )}
                  </div>
                  <p
                    className={`text-[10px] text-gray-400 mt-1 ${
                      isOwn ? "text-right mr-1" : "ml-1"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t bg-white">
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative inline-block mb-2">
            <img
              src={imagePreview}
              alt="preview"
              className="h-20 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            disabled={(!text.trim() && !image) || isSending}
            className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
