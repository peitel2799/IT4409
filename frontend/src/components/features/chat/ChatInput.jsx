import EmojiPicker from "emoji-picker-react";
import { Paperclip, Send, Smile } from "lucide-react";
import { useState } from "react";
import { useChat } from "../../../context/ChatContext";

export default function ChatInput({ chat }) {
  const [text, setText] = useState("");
  const { sendMessage } = useChat();
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !chat) return;
    await sendMessage(chat._id || chat.id, text.trim());
    setText("");
  };

  return (
    <div className="relative">
      {isEmojiPickerOpen && (
        <div className="absolute bottom-full right-20 mb-2 z-10">
          <EmojiPicker
            open={isEmojiPickerOpen}
            onEmojiClick={(emoji) => {
              setText(prev => prev + emoji.emoji);
              setEmojiPickerOpen(false);
            }}
            className="custom-emoji-picker"
            previewConfig={{showPreview: false}}
          />
        </div>
      )}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-[24px] focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-100 focus-within:border-pink-300 transition-all shadow-sm">
        <button type="button" className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
        />

        <button type="button" onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
          <Smile size={20} />
        </button>

        <button
          type="submit"
          disabled={!text.trim()}
          className={`p-3 rounded-full transition-all shadow-sm flex items-center justify-center 
            ${text.trim() ? "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          <Send size={18} className={text.trim() ? "ml-0.5" : ""} />
        </button>
      </div>
    </form>
  </div>
  );
}