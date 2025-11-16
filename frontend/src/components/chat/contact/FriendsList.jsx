import { useEffect, useState } from "react";
import { useChat } from "../../../context/ChatContext"; 
import { LoaderIcon, UserSearch, ArrowLeft } from "lucide-react";
import FriendItem from "./FriendItem"; 

export default function FriendsList({ onChatSelect, onClose }) {
  const { allContacts, getAllContacts, isUsersLoading, chats } = useChat();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredContacts = allContacts.filter(contact => {
    const nameMatch = contact.fullName?.toLowerCase().includes(normalizedSearch);
    const emailMatch = contact.email?.toLowerCase().includes(normalizedSearch);
    return nameMatch || emailMatch;
  });

  return (
    <div
      className="relative flex flex-col w-80 h-full bg-white border-r border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Your Friends</h2>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="p-3 border-b">
        <div className="flex items-center bg-gray-100 rounded-md p-2">
          <UserSearch className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email"
            className="flex-1 ml-2 bg-transparent text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Danh sách */}
      <div className="flex-1 overflow-y-auto p-2">
        {isUsersLoading && (
          <div className="flex items-center justify-center h-full">
            <LoaderIcon className="w-6 h-6 animate-spin text-pink-400" />
          </div>
        )}
        
        {!isUsersLoading && filteredContacts.length === 0 && (
          <div className="flex items-center justify-center h-full text-center p-4">
            <p className="text-gray-500">
              {allContacts.length === 0 
                ? "No friends." 
                : "No Result."
              }
            </p>
          </div>
        )}

        {!isUsersLoading && filteredContacts.length > 0 && (
          <div>
            {filteredContacts.map((contact) => (
              <FriendItem 
                key={contact._id || contact.id} 
                contact={contact}
                chats={chats}
                onChatSelect={onChatSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}