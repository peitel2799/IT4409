export default function MessageBubble({ message, isMe, avatar }) {
  if (message.isSystem) {
      return <div className="text-center text-xs text-gray-400 my-4 italic bg-gray-50 py-1 px-3 rounded-full w-fit mx-auto">{message.text}</div>;
  }

  return (
    <div className={`flex items-end mb-1 gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && (
         <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-100 object-cover mb-1" />
      )}
      
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
        <div className={`px-4 py-2 text-[14.5px] leading-relaxed shadow-sm break-words
            ${isMe 
              ? "bg-gradient-to-br from-pink-500 to-rose-400 text-white rounded-[20px] rounded-tr-sm" 
              : "bg-white border border-gray-100 text-gray-800 rounded-[20px] rounded-tl-sm"
            }`}>
          {message.text}
        </div>
        
        <span className={`text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none`}>
            {message.displayTime}
        </span>
      </div>
    </div>
  );
}