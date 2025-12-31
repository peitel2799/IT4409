import { useState, useEffect, useCallback } from "react";
import { Plus, Users } from "lucide-react";
import { useChat } from "../../../context/ChatContext";
import { useGroup } from "../../../context/GroupContext";
import SidebarHeader from "./SidebarHeader";
import ConversationItem from "./ConversationItem";
import GroupItem from "./GroupItem";
import CreateGroupModal from "./CreateGroupModal";

export default function ConversationSidebar({
  selectedChat,
  onChatSelect,
  onHighlightMessage,
  selectedGroup,
  onGroupSelect,
}) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("chats"); // "chats" | "groups"
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const { homeStats, getHomeStats, setSelectedUser } = useChat();
  const { groups, isLoadingGroups } = useGroup();

  const chats = homeStats?.chats || [];

  useEffect(() => {
    getHomeStats();
  }, [getHomeStats]);

  // Handle chat selection from search
  const handleSelectChat = useCallback(
    (user) => {
      // Normalize the user object for the chat context
      const normalizedUser = {
        _id: user._id,
        fullName: user.fullName || user.name,
        profilePic: user.profilePic || user.avatar,
        email: user.email,
        isOnline: user.isOnline,
      };

      setSelectedUser(normalizedUser);
      if (onChatSelect) {
        onChatSelect(normalizedUser);
      }
    },
    [setSelectedUser, onChatSelect]
  );

  // Handle message selection from search (navigate and highlight)
  const handleSelectMessage = useCallback(
    (messageId) => {
      if (onHighlightMessage) {
        // Small delay to allow chat to load first
        setTimeout(() => {
          onHighlightMessage(messageId);
        }, 300);
      }
    },
    [onHighlightMessage]
  );

  // Logic lọc danh sách chats
  const filteredChats = chats.filter((chat) => {
    const matchesFilter = filter === "unread" ? chat.unreadCount > 0 : true;
    const searchLow = searchQuery.toLowerCase();
    const matchesName = (chat.fullName || chat.name || "")
      .toLowerCase()
      .includes(searchLow);
    const matchesEmail = (chat.email || "").toLowerCase().includes(searchLow);
    return matchesFilter && (matchesName || matchesEmail);
  });

  // Logic lọc danh sách groups
  const filteredGroups = groups.filter((group) => {
    const searchLow = searchQuery.toLowerCase();
    return group.name.toLowerCase().includes(searchLow);
  });

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <SidebarHeader
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectChat={handleSelectChat}
        onSelectMessage={handleSelectMessage}
      />

      {/* View Mode Tabs */}
      <div className="flex border-b border-gray-100 px-2">
        <button
          onClick={() => setViewMode("chats")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            viewMode === "chats"
              ? "text-pink-600 border-b-2 border-pink-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Tin nhắn
        </button>
        <button
          onClick={() => setViewMode("groups")}
          className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            viewMode === "groups"
              ? "text-purple-600 border-b-2 border-purple-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={14} />
          Nhóm
        </button>
      </div>

      {/* Create Group Button (only in groups view) */}
      {viewMode === "groups" && (
        <div className="px-3 py-2">
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Tạo nhóm mới
          </button>
        </div>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pt-2 pb-4 custom-scrollbar">
        {viewMode === "chats" ? (
          <>
            {filteredChats.map((chat) => (
              <ConversationItem
                key={chat._id}
                chat={chat}
                isActive={selectedChat?._id === chat._id && !selectedGroup}
                onClick={() => {
                  onChatSelect(chat);
                  if (onGroupSelect) onGroupSelect(null);
                  setSearchQuery("");
                }}
              />
            ))}
            {filteredChats.length === 0 && (
              <div className="text-center text-gray-400 text-xs mt-10">
                {searchQuery ? "Không tìm thấy" : "Chưa có tin nhắn"}
              </div>
            )}
          </>
        ) : (
          <>
            {isLoadingGroups ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {filteredGroups.map((group) => (
                  <GroupItem
                    key={group._id}
                    group={group}
                    isActive={selectedGroup?._id === group._id}
                    onClick={() => {
                      if (onGroupSelect) onGroupSelect(group);
                      onChatSelect(null);
                      setSearchQuery("");
                    }}
                  />
                ))}
                {filteredGroups.length === 0 && (
                  <div className="text-center text-gray-400 text-xs mt-10">
                    {searchQuery ? "Không tìm thấy" : "Chưa có nhóm nào"}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />
    </div>
  );
}
