import { PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import './AutoScroll.css'; 

// 1. AutoScroll List Component
export const AutoScrollList = ({ children }) => {
  return (
    <div className="scroll-container">
      <div className="scroll-content">
        {children}
        {children}
      </div>
    </div>
  );
};

// 2. Call Item
export const CallItem = ({ call }) => (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/40 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer hover:bg-white">
        <img src={call.avatar} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt={call.name} />
        <div className="flex-1 min-w-0">
            <h4 className="text-gray-800 font-bold text-sm truncate">{call.name}</h4>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                {call.type === 'missed' && <PhoneMissed size={12} className="text-red-500" />}
                {call.type === 'incoming' && <PhoneIncoming size={12} className="text-green-500" />}
                {call.type === 'outgoing' && <PhoneOutgoing size={12} className="text-blue-500" />}
                <span>{call.time}</span>
            </div>
        </div>
    </div>
);

// 3. Chat Item
export const ChatItem = ({ chat }) => (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/40 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer hover:bg-white">
        <img src={chat.avatar} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt={chat.name} />
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
                <h4 className="text-gray-800 font-bold text-sm truncate">{chat.name}</h4>
                <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
            </div>
            <p className="text-gray-600 text-xs truncate font-medium">{chat.lastMessage || chat.msg}</p>
        </div>
    </div>
);

// 4. Friend Item
export const FriendItem = ({ friend }) => (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/40 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer hover:bg-white">
        <div className="relative">
            <img src={friend.avatar} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt={friend.name} />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-gray-800 font-bold text-sm truncate">{friend.fullName || friend.name}</h4>
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">{friend.desc || "Friend"}</p>
        </div>
    </div>
);