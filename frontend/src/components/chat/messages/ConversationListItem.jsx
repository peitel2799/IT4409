export default function ConversationListItem({ chat, isActive, onClick }) {
  return (
    <div
      className={`flex items-center p-3 cursor-pointer transition-colors ${
        isActive ? "bg-[#FCE4EC]" : "hover:bg-gray-100" 
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <img
        src={chat.avatar}
        alt={chat.name}
        className="w-12 h-12 rounded-full mr-3"
      />
      {/* Tên và tin nhắn cuối */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{chat.name}</p>
        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
      </div>
      {/* Thời gian và số tin chưa đọc */}
      <div className="flex flex-col items-end text-xs ml-2">
        <span className="text-gray-400 mb-1">{chat.time}</span>
        {chat.unread > 0 && (
          <span className="flex items-center justify-center bg-red-500 text-white font-bold rounded-full w-5 h-5 text-center">
            {chat.unread}
          </span>
        )}
      </div>
    </div>
  );
}