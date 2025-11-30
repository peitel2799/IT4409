import { useChat } from "../../../context/ChatContext";

export default function FriendItem({ contact, onChatSelect }) {
  const { chats } = useChat();

  const handleMessageClick = () => {
    const contactId = contact._id || contact.id;

    const existingChat = chats.find(chat => chat.id === contactId);

    const chatToSelect = existingChat || {
      _id: contactId,
      id: contactId,
      name: contact.fullName,
      avatar: contact.profilePic || `https://ui-avatars.com/api/?name=${contact.fullName}&background=random`,
      email: contact.email,
    };

    onChatSelect(chatToSelect);
  };

  return (
    <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
      <img
        src={
          contact.profilePic ||
          `https://ui-avatars.com/api/?name=${contact.fullName}&background=random`
        }
        alt={contact.fullName}
        className="w-10 h-10 rounded-full mr-3"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{contact.fullName}</p>
        <p className="text-sm text-gray-500 truncate">{contact.email}</p>
      </div>
      <button
        onClick={handleMessageClick}
        className="ml-2 px-3 py-1 text-xs font-semibold text-white bg-pink-400 rounded-full hover:bg-pink-500"
      >
        Chat
      </button>
    </div>
  );
}
