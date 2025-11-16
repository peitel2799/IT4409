import { ChevronDown, ChevronRight, Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";

const InfoItem = ({ icon: Icon, label }) => (
  <button className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <Icon size={16} />
    </div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function InfoSidebar({ chat, onClose }) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const mockImages = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/${i + 133}/300/300`,
  }));

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

        {/* Shared Media Section */}
        <div className="py-2">
          <button
            onClick={() => setIsMediaOpen(!isMediaOpen)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <ImageIcon size={18} />
              </div>
              <span className="font-semibold text-sm">Shared Media</span>
            </div>
            {isMediaOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
          </button>

          {isMediaOpen && (
            <div className="p-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {mockImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2">
                  {mockImages.map((img) => (
                    <div key={img.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={img.url}
                        alt="Shared"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">No media shared yet</p>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Delete Button
          <button className="w-full bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition">
            Delete Conversation
          </button> */}
      </div>
    </div>
  );
}
