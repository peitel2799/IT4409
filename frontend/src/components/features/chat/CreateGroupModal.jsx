import { useState, useRef } from "react";
import { X, Users, Camera, Loader2, Check, Search } from "lucide-react";
import { useGroup } from "../../../context/GroupContext";
import { useFriend } from "../../../context/FriendContext";

export default function CreateGroupModal({ isOpen, onClose }) {
  const { createGroup, isCreatingGroup } = useGroup();
  const { friends } = useFriend();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Filter friends by search
  const filteredFriends = friends.filter((friend) => {
    const searchLow = searchQuery.toLowerCase();
    return (
      friend.fullName?.toLowerCase().includes(searchLow) ||
      friend.email?.toLowerCase().includes(searchLow)
    );
  });

  // Toggle member selection
  const toggleMember = (friendId) => {
    setSelectedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Please select at least one member");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", groupName.trim());
      formData.append("description", description.trim());
      formData.append("memberIds", JSON.stringify(selectedMembers));
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await createGroup(formData);
      handleClose();
    } catch (error) {
      // Error is handled in context
    }
  };

  // Reset and close
  const handleClose = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
    setAvatarPreview(null);
    setAvatarFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-indigo-500" />
            Create New Group
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Group avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-2 border-indigo-200">
                    <Users size={32} className="text-white" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all resize-none"
                rows={2}
                maxLength={500}
              />
            </div>

            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Members <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">
                  ({selectedMembers.length} selected)
                </span>
              </label>

              {/* Search Friends */}
              <div className="flex items-center bg-gray-100 rounded-xl p-2.5 mb-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 ml-2 bg-transparent text-sm focus:outline-none text-gray-700"
                />
              </div>

              {/* Friends List */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => {
                    const isSelected = selectedMembers.includes(friend._id);
                    const avatarUrl =
                      friend.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        friend.fullName || "U"
                      )}&background=random`;

                    return (
                      <div
                        key={friend._id}
                        onClick={() => toggleMember(friend._id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                          isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={avatarUrl}
                          alt={friend.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 truncate">
                            {friend.fullName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {friend.email}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-indigo-500"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    {searchQuery
                      ? "No friends found"
                      : "No friends to add. Add some friends first!"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isCreatingGroup ||
              !groupName.trim() ||
              selectedMembers.length === 0
            }
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingGroup ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users size={16} />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
