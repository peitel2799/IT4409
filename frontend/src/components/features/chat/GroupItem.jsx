import { Users } from "lucide-react";

export default function GroupItem({ group, isActive, onClick }) {
  // Format time ago
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Avatar URL - use group avatar or default
  const avatarUrl =
    group.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      group.name || "G"
    )}&background=6366f1&color=fff`;

  // Member count
  const memberCount = group.members?.length || 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer transition-all rounded-xl mx-2 mb-1 ${
        isActive
          ? "bg-indigo-50 border border-indigo-100"
          : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      {/* Group Avatar */}
      <div className="relative">
        {group.avatar ? (
          <img
            src={avatarUrl}
            alt={group.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border border-indigo-200">
            <Users size={22} className="text-white" />
          </div>
        )}
        {/* Member count badge */}
        <span className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white">
          {memberCount}
        </span>
      </div>

      {/* Group Info */}
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex justify-between items-baseline">
          <p
            className={`font-semibold text-sm truncate ${
              isActive ? "text-indigo-700" : "text-gray-800"
            }`}
          >
            {group.name}
          </p>
          <span className="text-[10px] text-gray-400">
            {formatTimeAgo(group.updatedAt)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p
            className={`text-xs truncate max-w-[140px] ${
              isActive ? "text-indigo-400 font-medium" : "text-gray-500"
            }`}
          >
            {group.lastMessage || group.description || `${memberCount} members`}
          </p>
          {group.unreadCount > 0 && (
            <span className="flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1">
              {group.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

