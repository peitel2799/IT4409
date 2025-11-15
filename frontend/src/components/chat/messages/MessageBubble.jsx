export default function MessageBubble({ message, isMe, avatar }) {
  if (message.isSystem) {
    return (
      <div className="text-center text-sm text-gray-500 my-2">
        {message.text}
      </div>
    );
  }

  if (message.isAction) {
    return (
      <div className="flex justify-end">
        <button className="text-sm text-[#6C63FF] font-semibold hover:underline"> 
          {message.text}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-end ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <img
          src={avatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}

      <div
        className={`relative max-w-xs md:max-w-md px-3 py-2 rounded-2xl mb-1 ${
          isMe
            ? "bg-pink-400 text-gray-900" 
            : "bg-[#FCE4EC] text-gray-900" 
        }`}
      >
        <p>{message.text}</p>
        <span className="text-xs text-gray-600 mt-1 block text-right">
          {message.displayTime}
        </span>

      </div>
    </div>
  );
}