import { Phone, Video, MessageCircle, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";

export default function CallHistoryItem({ call, onCall, onVideo, onMessage }) {
  // Xác định icon và màu sắc dựa trên loại cuộc gọi
  const getCallInfo = () => {
    switch (call.type) {
      case "missed":
        return { icon: PhoneMissed, color: "text-red-500", bg: "bg-red-50", label: "Missed call" };
      case "incoming":
        return { icon: PhoneIncoming, color: "text-blue-500", bg: "bg-blue-50", label: "Incoming" };
      case "outgoing":
        return { icon: PhoneOutgoing, color: "text-green-500", bg: "bg-green-50", label: "Outgoing" };
      default:
        return { icon: Phone, color: "text-gray-500", bg: "bg-gray-50", label: "Unknown" };
    }
  };

  const { icon: TypeIcon, color, label } = getCallInfo();

  return (
    <div className="group flex items-center justify-between p-4 bg-white border border-gray-50 rounded-[20px] hover:shadow-md hover:border-pink-100 transition-all cursor-default">
      {/* Thông tin bên trái */}
      <div className="flex items-center gap-4">
        <div className="relative">
             <img src={call.avatar} alt={call.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-50 group-hover:border-pink-200 transition-colors" />
             {/* Icon loại cuộc gọi nhỏ ở góc */}
             <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm border border-gray-100 ${color}`}>
                <TypeIcon size={10} />
             </div>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 text-sm md:text-base">{call.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
             <span className={call.type === 'missed' ? 'text-red-500 font-medium' : ''}>{label}</span>
             <span>•</span>
             <span>{call.time}</span>
             <span className="hidden md:inline">• {call.date}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hiện khi hover) */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all translate-x-2 md:group-hover:translate-x-0">
        <button 
            onClick={() => onMessage(call)}
            className="p-2.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors" 
            title="Message"
        >
          <MessageCircle size={18} />
        </button>
        <button 
            onClick={() => onCall(call)}
            className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
            title="Voice Call"
        >
          <Phone size={18} />
        </button>
        <button 
            onClick={() => onVideo(call)}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            title="Video Call"
        >
          <Video size={18} />
        </button>
      </div>
    </div>
  );
}