import {  Send } from "lucide-react";
import { useState } from "react";

export default function ChatInput() {
  const [text, setText] = useState("");

  return (
    <div className="p-3 border-t border-gray-200 bg-white">
      <div className="flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your message ..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400" // Thay màu focus
        />
        <button className="ml-3 text-gray-500" > 
          <Send className="w-5 h-5 text-pink-300 hover:text-pink-500" /> 
        </button>
      </div>
    </div>
  );
}