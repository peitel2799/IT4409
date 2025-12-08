import { Phone, Video, Sidebar, Pencil } from "lucide-react";

export default function ChatHeader({ chat, onToggleInfoSidebar, isInfoSidebarOpen }) {
  
  // Hàm xử lý mở cửa sổ gọi
  const handleStartCall = (isVideo) => {
    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const params = new URLSearchParams({
      name: chat.name,
      avatar: chat.avatar,
      id: chat.id || chat._id, // Đảm bảo lấy đúng ID
      video: isVideo ? "true" : "false"
    });

    window.open(
      `/call-window?${params.toString()}`,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3 cursor-pointer group">
        <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
        <div>
           <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-pink-600 transition-colors">{chat.name}</h3>
              <Pencil size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           <p className="text-xs text-green-500 font-medium flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
           </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Nút Gọi Thoại */}
        <button 
            onClick={() => handleStartCall(false)}
            className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
            title="Voice Call"
        >
            <Phone size={20} />
        </button>

        {/* Nút Gọi Video */}
        <button 
            onClick={() => handleStartCall(true)}
            className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
            title="Video Call"
        >
            <Video size={20} />
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        
        <button
          onClick={onToggleInfoSidebar}
          className={`p-2 rounded-xl transition-all ${
            isInfoSidebarOpen ? "bg-pink-50 text-pink-500" : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          <Sidebar size={20} />
        </button>
      </div>
    </div>
  );
}