import { useEffect } from 'react';
import { Phone, MessageCircle, Users } from 'lucide-react';
import { useChat } from "../../../context/ChatContext";
import { useNavigate } from 'react-router-dom';

import SectionCard from './SectionCard';
import { CallItem, ChatItem, FriendItem } from './HomeItems';

export default function HomeDashboard() {
  const { homeStats, allContacts, getHomeStats, getAllContacts } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    getHomeStats();
    getAllContacts();
  }, [getHomeStats, getAllContacts]);

  const handleNavigation = (path) => {
    navigate(`/chat/${path}`);
  };

  return (
    <div className="h-full w-full p-4 overflow-hidden font-sans text-gray-800">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* CALLS */}
        <SectionCard
          title="Calls" subtitle="Recent history" icon={Phone} image="/call.jpg"
          items={homeStats.calls}
          renderItem={(item) => <CallItem key={item._id || item.id} call={item} />}
          onClick={() => handleNavigation('calls')} 
        />

        {/* CHATS */}
        <SectionCard
          title="Chats" subtitle="New messages" icon={MessageCircle} image="/chat.jpg"
          items={homeStats.chats}
          renderItem={(item) => <ChatItem key={item._id || item.id} chat={item} />}
          onClick={() => handleNavigation('messages')}
        />

        {/* FRIENDS */}
        <SectionCard
          title="Friends" subtitle="Online status" icon={Users} image="/friends.jpg"
          items={allContacts}
          renderItem={(item) => <FriendItem key={item._id || item.id} friend={item} />}
          onClick={() => handleNavigation('friends')}
        />
      </div>
    </div>
  );
}