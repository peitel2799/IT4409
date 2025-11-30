import { MessageCircle, MoreVertical, MoreHorizontal, UserCheck, UserX, Check, X } from "lucide-react";

export default function FriendCard({ user, type, onStartChat, viewMode }) {
  
  // --- 1. Giao diện tab "Friend Requests" (Lời mời kết bạn) ---
  // Tab này thường có cấu trúc riêng (Nút Confirm/Delete) nên ta tách riêng xử lý
  if (type === 'requests') {
    const isList = viewMode === 'list';
    return (
      <div className={`bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md ${
        isList 
          ? 'p-3 rounded-xl flex items-center justify-between gap-4' // Layout ngang
          : 'p-4 rounded-2xl flex flex-col gap-4' // Layout dọc
      }`}>
        {/* Avatar & Info */}
        <div className={`flex items-center gap-3 ${!isList ? 'flex-col text-center' : ''}`}>
           <img src={user.avatar} alt={user.name} className={`${isList ? 'w-10 h-10' : 'w-14 h-14'} rounded-full object-cover`} />
           <div className={!isList ? 'flex flex-col items-center' : ''}>
               <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
               <p className="text-xs text-gray-400">{user.mutual || 0} mutual friends</p>
           </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-2 ${isList ? 'shrink-0' : 'w-full'}`}>
            <button className={`${isList ? 'px-3 py-1.5' : 'flex-1 py-2'} bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold transition-colors`}>
               Confirm
            </button>
            <button className={`${isList ? 'px-3 py-1.5' : 'flex-1 py-2'} bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-colors`}>
               Delete
            </button>
        </div>
      </div>
    );
  }

  // --- 2. Giao diện tab "All Friends / Online" (Mặc định) ---
  
  // >>> CASE A: LIST VIEW (Giao diện danh sách nằm ngang) <<<
  if (viewMode === 'list') {
    return (
      <div className="group bg-white p-3 px-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all flex items-center justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
            {user.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="min-w-0">
             <h3 className="font-bold text-gray-800 text-sm truncate">{user.fullName || user.name}</h3>
             <p className="text-xs text-gray-400 truncate">{user.email || "No status"}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
           <button 
             onClick={() => onStartChat(user)}
             className="p-2 bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white rounded-lg transition-colors"
             title="Send Message"
           >
             <MessageCircle size={18} />
           </button>
           <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
             Delete
           </button>
        </div>
      </div>
    );
  }

  // >>> CASE B: GRID VIEW (Giao diện thẻ dọc - Mặc định cũ) <<<
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all flex flex-col items-center text-center relative group">
      <div className="relative mb-3">
        <img src={user.avatar} alt={user.fullName || user.name} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 group-hover:border-pink-50 transition-colors" />
        {user.status === 'online' && (
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{user.fullName || user.name}</h3>
        <p className="text-gray-400 text-xs truncate max-w-[150px]">{user.email || "Friend"}</p>
      </div>

      <button 
        onClick={() => onStartChat(user)}
        className="w-full py-2.5 bg-white border border-pink-200 text-pink-500 hover:bg-pink-500 hover:text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
      >
        <MessageCircle size={18} /> Message
      </button>
    </div>
  );
}