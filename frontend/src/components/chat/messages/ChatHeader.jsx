import { Phone, Video, Sidebar, Pencil } from "lucide-react";

export default function ChatHeader({
  chat,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
}) {
  return (
    <div className="flex items-center p-3 border-b border-gray-200 shadow-sm">
      {/* Thông tin user */}
      <div className="flex items-center cursor-pointer">
        <img
          src={chat.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
          alt={chat.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex flex-row">
          <p className="font-semibold text-gray-900 mr-3">{chat.name}</p>
          <button id="editnickname">< Pencil className="w-5 h-5" /></button>

        </div>
      </div>

      <div className="flex items-center ml-auto space-x-4">
        <button className="text-gray-400 hover:text-black" title="Cuộc gọi thoại"> {/* Thay màu hover */}
          <Phone className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-black" title="Cuộc gọi video"> {/* Thay màu hover */}
          <Video className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleInfoSidebar}
          className={`p-1 rounded-full ${isInfoSidebarOpen
              ? "bg-[#FCE4EC] text-pink-400"
              : "text-gray-400 hover:text-black"
            }`}
          title="Info your friend"
        >
          <Sidebar className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}