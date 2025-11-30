export default function ConversationItem({ chat, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer transition-all rounded-xl mx-2 mb-1 ${
        isActive ? "bg-pink-50 border border-pink-100" : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      <div className="relative">
        <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </div>

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex justify-between items-baseline">
           <p className={`font-semibold text-sm truncate ${isActive ? "text-pink-700" : "text-gray-800"}`}>
             {chat.name}
           </p>
           <span className="text-[10px] text-gray-400">{chat.time}</span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
           <p className={`text-xs truncate max-w-[140px] ${isActive ? "text-pink-400 font-medium" : "text-gray-500"}`}>
             {chat.lastMessage}
           </p>
           {chat.unread > 0 && (
             <span className="flex items-center justify-center bg-pink-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1">
               {chat.unread}
             </span>
           )}
        </div>
      </div>
    </div>
  );
}