import { Sidebar, ChevronLeft, Users } from "lucide-react";
import { useGroup } from "../../../context/GroupContext";

export default function GroupChatHeader({
  group,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
}) {
  const { setSelectedGroup } = useGroup();

  if (!group) return null;

  const memberCount = group.members?.length || 0;

  // Avatar URL - use group avatar or default
  const avatarUrl =
    group.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      group.name || "G"
    )}&background=6366f1&color=fff`;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {/* Back button for mobile */}
        <button
          onClick={() => setSelectedGroup(null)}
          className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Group Avatar */}
        {group.avatar ? (
          <img
            src={avatarUrl}
            alt={group.name}
            className="w-10 h-10 rounded-full border object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
        )}

        {/* Group Info */}
        <div>
          <h3 className="font-bold text-sm text-gray-800">{group.name}</h3>
          <p className="text-xs text-gray-400">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Toggle Info Sidebar */}
        <button
          onClick={onToggleInfoSidebar}
          className={`p-2 rounded-xl ${
            isInfoSidebarOpen
              ? "bg-indigo-50 text-indigo-500"
              : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
          }`}
          title="Group Info"
        >
          <Sidebar size={20} />
        </button>
      </div>
    </div>
  );
}

