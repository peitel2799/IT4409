import { X, Users, Search, Crown, UserMinus } from "lucide-react";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";

export default function GroupInfoSidebar({ group, onClose }) {
  const { onlineUsers } = useSocket();
  const { authUser } = useAuth();

  if (!group) return null;

  const avatarUrl =
    group.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      group.name || "G"
    )}&background=6366f1&color=fff`;

  const members = group.members || [];
  const admins = group.admins || [];
  const createdBy = group.createdBy;

  // Check if a user is admin
  const isAdmin = (userId) => {
    return admins.some(
      (admin) => (admin._id || admin) === (userId._id || userId)
    );
  };

  // Check if a user is creator
  const isCreator = (userId) => {
    return (createdBy?._id || createdBy) === (userId._id || userId);
  };

  // Check if user is online
  const isOnline = (userId) => {
    const id = userId?._id || userId;
    return onlineUsers.includes(id);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white border-l border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm">Group Info</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Group Avatar + Info */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-gray-100">
          {group.avatar ? (
            <img
              src={avatarUrl}
              alt={group.name}
              className="w-24 h-24 rounded-full mb-3 border-4 border-gray-50 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mb-3 border-4 border-gray-50 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <Users size={40} className="text-white" />
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-800 text-center">
            {group.name}
          </h2>
          {group.description && (
            <p className="text-sm text-gray-400 mt-1 text-center">
              {group.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search in chat */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center bg-gray-50 rounded-xl p-2.5">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search in chat..."
              className="bg-transparent text-sm ml-2 w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            Members ({members.length})
          </h4>
          <div className="space-y-2">
            {members.map((member) => {
              const memberId = member._id || member;
              const memberAvatar =
                member.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.fullName || "U"
                )}&background=random`;
              const memberOnline = isOnline(memberId);
              const memberIsAdmin = isAdmin(memberId);
              const memberIsCreator = isCreator(memberId);
              const isCurrentUser = memberId === authUser?._id;

              return (
                <div
                  key={memberId}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={memberAvatar}
                      alt={member.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    {memberOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {member.fullName || "Unknown"}
                        {isCurrentUser && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            (You)
                          </span>
                        )}
                      </p>
                      {memberIsCreator && (
                        <Crown
                          size={14}
                          className="text-yellow-500 flex-shrink-0"
                          title="Creator"
                        />
                      )}
                      {memberIsAdmin && !memberIsCreator && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {member.email || (memberOnline ? "Online" : "Offline")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Group Button */}
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-100 transition font-medium text-sm">
            <UserMinus size={16} />
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
}
