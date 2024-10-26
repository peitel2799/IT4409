import { useState, useEffect } from "react";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import { useGroup } from "../../../context/GroupContext";
import GroupItem from "./GroupItem";

export default function GroupList({
  selectedGroup,
  onGroupSelect,
  onCreateGroup,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const { groups, isGroupsLoading, getGroups } = useGroup();

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  // Filter groups by search query
  const filteredGroups = groups.filter((group) => {
    const searchLow = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLow) ||
      (group.description || "").toLowerCase().includes(searchLow)
    );
  });

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 pb-2 border-b border-gray-50">
        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-xl p-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 bg-transparent text-sm focus:outline-none text-gray-700"
          />
        </div>

        {/* Create Group Button */}
        <button
          onClick={onCreateGroup}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Create New Group
        </button>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto pt-2 pb-4 custom-scrollbar">
        {isGroupsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <GroupItem
              key={group._id}
              group={group}
              isActive={selectedGroup?._id === group._id}
              onClick={() => {
                onGroupSelect(group);
                setSearchQuery("");
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {searchQuery ? "No groups found" : "No groups yet"}
            </p>
            <p className="text-gray-400 text-xs mt-1 text-center">
              {searchQuery
                ? "Try a different search"
                : "Create a group to start chatting with multiple friends"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

