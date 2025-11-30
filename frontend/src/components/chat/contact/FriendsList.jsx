import { useEffect, useState } from "react";
import { UserSearch, Plus, UserCheck, X } from "lucide-react";
import { useChat } from "../../../context/ChatContext";
import FriendItem from "./FriendItem";
import AddFriendsModal from "../../AddFriendsModal";

export default function FriendsList() {
  const {
    friends,
    friendRequests,
    getFriends,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    isFriendActionLoading,
    isUsersLoading,
  } = useChat();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("friends"); // "friends" or "requests"

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, [getFriends, getFriendRequests]);

  // Tự động chuyển sang tab Requests khi có request mới
  useEffect(() => {
    if (friendRequests.length > 0 && activeTab === "friends") {
      // Chỉ tự động chuyển nếu đang ở tab Friends
      // (không chuyển nếu user đã chủ động chọn tab Requests)
      setActiveTab("requests");
    }
  }, [friendRequests.length]); // Chỉ trigger khi số lượng thay đổi

  const filtered = friends.filter((friend) => {
    const keyword = search.toLowerCase();
    return (
      friend.fullName?.toLowerCase().includes(keyword) ||
      friend.email?.toLowerCase().includes(keyword)
    );
  });

  const handleAccept = async (userId) => {
    await acceptFriendRequest(userId);
    await Promise.all([getFriends(), getFriendRequests()]);
  };

  const handleReject = async (userId) => {
    await rejectFriendRequest(userId);
    await getFriendRequests();
  };

  return (
    <div className="flex flex-col w-80 h-full bg-white border-r">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Friends</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-pink-500 text-white rounded-full hover:bg-pink-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Tabs: Friends và Requests */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "friends"
              ? "border-b-2 border-pink-500 text-pink-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "requests"
              ? "border-b-2 border-pink-500 text-pink-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Requests
          {friendRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {friendRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "friends" && (
        <>
          <div className="p-3 border-b">
            <div className="flex items-center bg-gray-100 rounded-md px-3">
              <UserSearch className="w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends"
                className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isUsersLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}

            {!isUsersLoading && filtered.length === 0 && (
              <div className="flex items-center justify-center h-full text-center p-4">
                <p className="text-gray-500">
                  {friends.length === 0
                    ? "No friends yet. Click Add to find friends!"
                    : "No friends match your search."}
                </p>
              </div>
            )}

            {!isUsersLoading && filtered.length > 0 && (
              <div>
                {filtered.map((friend) => (
                  <FriendItem
                    key={friend._id || friend.id}
                    contact={friend}
                    onChatSelect={(chat) => {
                      // Handle chat selection if needed
                      console.log("Selected chat:", chat);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "requests" && (
        <div className="flex-1 overflow-y-auto p-2">
          {isUsersLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          )}

          {!isUsersLoading && friendRequests.length === 0 && (
            <div className="flex items-center justify-center h-full text-center p-4">
              <p className="text-gray-500">No pending friend requests.</p>
            </div>
          )}

          {!isUsersLoading && friendRequests.length > 0 && (
            <div className="space-y-2">
              {friendRequests.map((request) => (
                <div
                  key={request._id || request.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={
                        request.profilePic ||
                        `https://ui-avatars.com/api/?name=${request.fullName}&background=random`
                      }
                      alt={request.fullName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {request.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {request.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => handleAccept(request._id || request.id)}
                      disabled={isFriendActionLoading}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-pink-500 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Accept"
                    >
                      <UserCheck className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request._id || request.id)}
                      disabled={isFriendActionLoading}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddFriendsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
