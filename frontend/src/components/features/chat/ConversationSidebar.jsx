import { useState, useEffect } from "react";
import { Search, Users, MessageCircle, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useChat } from "../../../context/ChatContext";
import { useGroup } from "../../../context/GroupContext";
import ConversationItem from "./ConversationItem";
import GroupItem from "./GroupItem";
import CreateGroupModal from "./CreateGroupModal";

export default function ConversationSidebar({
  selectedChat,
  onChatSelect,
  selectedGroup,
  onGroupSelect,
}) {
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "groups"
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const { homeStats, getHomeStats } = useChat();
  const { groups, getGroups } = useGroup();
export default function ConversationSidebar({ selectedChat, onChatSelect, onHighlightMessage }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { homeStats, getHomeStats, setSelectedUser } = useChat();

  const chats = homeStats?.chats || [];

  useEffect(() => {
    getHomeStats();
    getGroups();
  }, [getHomeStats, getGroups]);

  // Filter chats
  const filteredChats = chats.filter((chat) => {
  // Handle chat selection from search
  const handleSelectChat = useCallback((user) => {
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
  }, [setSelectedUser, onChatSelect]);

  // Handle message selection from search (navigate and highlight)
  const handleSelectMessage = useCallback((messageId) => {
    if (onHighlightMessage) {
      // Small delay to allow chat to load first
      setTimeout(() => {
        onHighlightMessage(messageId);
      }, 300);
    }
  }, [onHighlightMessage]);

  // Logic lọc danh sách
  const filteredChats = chats.filter((chat) => {
    //Lọc theo tab (Tất cả hoặc Chưa đọc)
    const matchesFilter = filter === "unread" ? chat.unreadCount > 0 : true;
    const searchLow = searchQuery.toLowerCase();
    const keySearch =
      chat.name?.toLowerCase().includes(searchLow) ||
      chat.fullName?.toLowerCase().includes(searchLow) ||
      (chat.lastMessage || "").toLowerCase().includes(searchLow);
    return matchesFilter && keySearch;
  });

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    const matchesFilter = filter === "unread" ? group.unreadCount > 0 : true;
    const searchLow = searchQuery.toLowerCase();
    const keySearch =
      group.name?.toLowerCase().includes(searchLow) ||
      (group.description || "").toLowerCase().includes(searchLow);
    return matchesFilter && keySearch;

    // Kiểm tra Tên
    const matchesName = (chat.fullName || chat.name || "").toLowerCase().includes(searchLow);

    // Kiểm tra email
    const matchesEmail = (chat.email || "").toLowerCase().includes(searchLow);

    return matchesFilter && (matchesName || matchesEmail);
  });

  // Handle chat selection
  const handleChatSelect = (chat) => {
    onChatSelect(chat);
    if (onGroupSelect) onGroupSelect(null); // Clear group selection
    setSearchQuery("");
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    if (onGroupSelect) onGroupSelect(group);
    onChatSelect(null); // Clear chat selection
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 pb-2 border-b border-gray-50">
        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-xl p-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-50 transition-all">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "chats" ? "Search chats..." : "Search groups..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 bg-transparent text-sm focus:outline-none text-gray-700"
      <SidebarHeader
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectChat={handleSelectChat}
        onSelectMessage={handleSelectMessage}
      />

      <div className="flex-1 overflow-y-auto pt-2 pb-4 custom-scrollbar">
        {filteredChats.map((chat) => (
          <ConversationItem
            key={chat._id}
            chat={chat}
            isActive={selectedChat?._id === chat._id}
            onClick={() => {
              onChatSelect(chat);
              setSearchQuery(""); // Xóa từ khóa tìm kiếm khi chọn hội thoại
            }}
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === "chats"
                ? "bg-pink-100 text-pink-600"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <MessageCircle size={14} />
            Chats
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === "groups"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Users size={14} />
            Groups
            {groups.length > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {groups.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Buttons (for chats tab) or Create Group Button (for groups tab) */}
        {activeTab === "chats" ? (
          <div className="flex gap-2">
            {["all", "unread"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl capitalize transition-colors ${
                  filter === type
                    ? "bg-pink-100 text-pink-600"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {type === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm"
          >
            <Plus size={16} />
            Create Group
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-2 pb-4 custom-scrollbar">
        {activeTab === "chats" ? (
          // Chats List
          <>
            {filteredChats.map((chat) => (
              <ConversationItem
                key={chat._id}
                chat={chat}
                isActive={selectedChat?._id === chat._id}
                onClick={() => handleChatSelect(chat)}
              />
            ))}
            {filteredChats.length === 0 && (
              <div className="text-center text-gray-400 text-xs mt-10">
                {searchQuery ? "No results" : "No conversations"}
              </div>
            )}
          </>
        ) : (
          // Groups List
          <>
            {filteredGroups.map((group) => (
              <GroupItem
                key={group._id}
                group={group}
                isActive={selectedGroup?._id === group._id}
                onClick={() => handleGroupSelect(group)}
              />
            ))}
            {filteredGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Users size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {searchQuery ? "No groups found" : "No groups yet"}
                </p>
                <p className="text-gray-400 text-xs mt-1 text-center">
                  {searchQuery
                    ? "Try a different search"
                    : "Create a group to chat with friends"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </div>
  );
}
