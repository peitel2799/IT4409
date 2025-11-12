import {X,Search} from "lucide-react";

const ActionButton = ({ icon: Icon, text }) => (
  <button className="flex flex-col items-center text-gray-600 hover:text-[#6C63FF] w-20">
    <Icon className="w-5 h-5 mb-1" />
    <span className="text-xs text-center">{text}</span>
  </button>
);

export default function InfoSidebar({ chat, onClose }) {
  return (
    <div className="flex flex-col w-80 bg-white border-l border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-semibold">Thông tin hội thoại</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Thông tin Profile */}
        <div className="flex flex-col items-center p-4 border-b border-gray-200">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-20 h-20 rounded-full mb-3"
          />
          <h2 className="text-lg font-semibold">{chat.name}</h2>
          <p className="text-sm text-gray-500 mb-4">{chat.email}</p>
        </div>

        {/* Tìm kiếm tin nhắn */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center bg-gray-100 rounded-md p-2">
            <input
              type="text"
              placeholder="Search message"
              className="flex-1 ml-2 bg-transparent text-sm focus:outline-none"
            />
            <button><Search></Search></button>
          </div>
        </div>

        </div>
    </div>
  );
}