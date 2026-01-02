import { X, Search } from "lucide-react";

const InfoItem = ({ icon: Icon, label }) => (
  <button className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <Icon size={16} />
    </div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function InfoSidebar({ chat, onClose }) {

  const avatarUrl = chat?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.fullName || 'User')}&background=random`;
  return (
    <div className="flex flex-col w-full h-full bg-white border-l border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm">Chat Details</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center py-6 border-b border-gray-200">
          <img
            src={avatarUrl}
            alt={chat.fullName}
            className="w-24 h-24 rounded-full mb-3 border-4 border-gray-50"
          />
          <h2 className="text-xl font-bold text-gray-800">{chat.fullName}</h2>
          <p className="text-sm text-gray-400">
            {chat.email || "No email provided"}
          </p>
        </div>


          {/* Delete Button
          <button className="w-full bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition">
            Delete Conversation
          </button> */}
        </div>
      </div>
  );
}
