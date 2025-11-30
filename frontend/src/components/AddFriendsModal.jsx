import { useEffect, useMemo, useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { debounce } from "lodash";

export default function AddFriendsModal({ isOpen, onClose }) {
  const {
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    rejectFriendRequest,
    isFriendActionLoading,
    getFriends,
    getFriendRequests,
  } = useChat();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (value) => {
    try {
      setIsSearching(true);
      const data = await searchUsers(value);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce(handleSearch, 400), []);

  useEffect(() => {
    if (keyword.trim()) debouncedSearch(keyword);
    else setResults([]);
  }, [keyword, debouncedSearch]);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  if (!isOpen) return null;

  const handleAction = async (user, status) => {
    if (status === "friend") return;
    if (status === "pending") {
      await cancelFriendRequest(user._id);
    } else if (status === "incoming") {
      await acceptFriendRequest(user._id);
    } else {
      await sendFriendRequest(user._id);
    }

    // Refresh data after action
    await Promise.all([getFriends(), getFriendRequests()]);
    handleSearch(keyword);
  };
  const renderActionButton = (user) => {
    const { status } = user;
    const common =
      "px-3 py-1 rounded text-sm font-semibold disabled:opacity-60";
    switch (status) {
      case "friend":
        return (
          <button className={`${common} bg-green-100 text-green-600`} disabled>
            Friends
          </button>
        );
      case "pending":
        return (
          <button
            className={`${common} bg-yellow-100 text-yellow-700`}
            disabled={isFriendActionLoading}
            onClick={() => handleAction(user, "pending")}
          >
            Cancel
          </button>
        );
      case "incoming":
        return (
          <div className="flex gap-2">
            <button
              className={`${common} bg-pink-500 text-white`}
              disabled={isFriendActionLoading}
              onClick={async () => {
                await acceptFriendRequest(user._id);
                await Promise.all([getFriends(), getFriendRequests()]);
                handleSearch(keyword);
              }}
            >
              Accept
            </button>
            <button
              className={`${common} border border-gray-300`}
              disabled={isFriendActionLoading}
              onClick={async () => {
                await rejectFriendRequest(user._id);
                await getFriendRequests();
                handleSearch(keyword);
              }}
            >
              Reject
            </button>
          </div>
        );
      default:
        return (
          <button
            className={`${common} bg-pink-500 text-white`}
            disabled={isFriendActionLoading}
            onClick={() => handleAction(user, "none")}
          >
            Add
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add new friends
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name or email"
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-pink-400"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-pink-500" />
          )}
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {keyword && !results.length && !isSearching && (
            <p className="text-center text-gray-500">No users found.</p>
          )}

          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.profilePic ||
                    `https://ui-avatars.com/api/?name=${user.fullName}`
                  }
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {renderActionButton(user)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
