import { useState } from "react";
import { MessageCircle, Loader } from "lucide-react";
import { useFriend } from "../../../context/FriendContext";

export default function FriendCard({ user, type, onStartChat, viewMode }) {
  const { acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriend();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptFriendRequest(user._id);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectFriendRequest(user._id);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    setIsRemoving(true);
    try {
      await removeFriend(user._id);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsRemoving(false);
    }
  };

  // Get avatar with fallback
  const avatarUrl = user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.name || 'U')}&background=random`;
  const displayName = user.fullName || user.fullName || "Unknown";

  // --- 1. Friend Requests Tab ---
  if (type === 'requests') {
    const isList = viewMode === 'list';
    return (
      <div className={`bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md ${isList
          ? 'p-3 rounded-xl flex items-center justify-between gap-4'
          : 'p-4 rounded-2xl flex flex-col gap-4'
        }`}>
        {/* Avatar & Info */}
        <div className={`flex items-center gap-3 ${!isList ? 'flex-col text-center' : ''}`}>
          <img src={avatarUrl} alt={displayName} className={`${isList ? 'w-10 h-10' : 'w-14 h-14'} rounded-full object-cover`} />
          <div className={!isList ? 'flex flex-col items-center' : ''}>
            <h4 className="font-bold text-gray-800 text-sm">{displayName}</h4>
            <p className="text-xs text-gray-400">{user.email || "Friend request"}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-2 ${isList ? 'shrink-0' : 'w-full'}`}>
          <button
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className={`${isList ? 'px-3 py-1.5' : 'flex-1 py-2'} bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1`}
          >
            {isAccepting ? <Loader size={14} className="animate-spin" /> : null}
            Confirm
          </button>
          <button
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
            className={`${isList ? 'px-3 py-1.5' : 'flex-1 py-2'} bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1`}
          >
            {isRejecting ? <Loader size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    );
  }

  // --- 2. All Friends / Online Tab ---

  // >>> CASE A: LIST VIEW <<<
  if (viewMode === 'list') {
    return (
      <div className="group bg-white p-3 px-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all flex items-center justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
            {user.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-sm truncate">{displayName}</h3>
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
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Remove Friend"
          >
            {isRemoving ? <Loader size={18} className="animate-spin" /> : "Remove"}
          </button>
        </div>
      </div>
    );
  }

  // >>> CASE B: GRID VIEW (Default) <<<
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all flex flex-col items-center text-center relative group">
      <div className="relative mb-3">
        <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 group-hover:border-pink-50 transition-colors" />
        {user.status === 'online' && (
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{displayName}</h3>
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