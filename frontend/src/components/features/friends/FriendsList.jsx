import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import { useChat } from "../../../context/ChatContext";
import { useFriend } from "../../../context/FriendContext";
import { useSocket } from "../../../context/SocketContext";
import FriendCard from "./FriendCard";

// Component shared for: All, Online, Incoming Requests
export default function FriendsList({ type }) {
  const { searchQuery, viewMode, onStartChat } = useOutletContext();
  const { allContacts, getAllContacts } = useChat();
  const { getFriendRequests, friendRequests } = useFriend();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    getAllContacts();
    getFriendRequests();
  }, [getAllContacts, getFriendRequests]);

  // Add online status to contacts based on onlineUsers array
  const contactsWithStatus = (allContacts || []).map(contact => ({
    ...contact,
    status: onlineUsers.includes(contact._id) ? 'online' : 'offline'
  }));

  // Filter data based on 'type' prop
  const getData = () => {
    let rawData = [];
    switch (type) {
      case "requests":
        rawData = friendRequests || [];
        break;
      case "online":
        rawData = contactsWithStatus.filter(c => c.status === 'online');
        break;
      case "all":
      default:
        rawData = contactsWithStatus;
        break;
    }
    // Filter by search query
    return rawData.filter(item => {
      const name = item.fullName || item.name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const data = getData();

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-64">
        <Search size={40} className="opacity-20 mb-2" />
        <p className="text-sm">
          {type === 'online'
            ? "No friends are online right now."
            : type === 'requests'
              ? "No pending friend requests."
              : "No results found."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-gray-400 text-xs">
          {data.length} {data.length === 1 ? 'contact' : 'contacts'}
          {type === 'online' && ' online'}
        </p>
      </div>

      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-4 pr-2 overflow-y-auto custom-scrollbar"
          : "flex flex-col gap-2 pb-4 pr-2 overflow-y-auto custom-scrollbar"
      }>
        {data.map(user => (
          <FriendCard
            key={user._id || user.id}
            user={user}
            type={type}
            onStartChat={onStartChat}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}