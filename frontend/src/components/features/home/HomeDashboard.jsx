import { useEffect } from 'react';
import { Phone, MessageCircle, Users } from 'lucide-react';
import { useChat } from "../../../context/ChatContext";

import SectionCard from './SectionCard';
import { CallItem, ChatItem, FriendItem } from './HomeItems';

export default function HomeDashboard() {
  const { homeStats, allContacts, getHomeStats, getAllContacts } = useChat();

  useEffect(() => {
    getHomeStats();
    getAllContacts();
  }, [getHomeStats, getAllContacts]);

  return (
    <div className="h-full w-full p-4 overflow-hidden font-sans text-gray-800">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/*CALLS */}
        <SectionCard
          title="Calls" subtitle="Recent history" icon={Phone} image="/call.jpg"
          items={homeStats.calls}
          renderItem={(item) => <CallItem key={item.id} call={item} />}
        />

        {/*CHATS */}
        <SectionCard
          title="Chats" subtitle="New messages" icon={MessageCircle} image="/chat.jpg"
          items={homeStats.chats}
          renderItem={(item) => <ChatItem key={item.id} chat={item} />}
        />

        {/*FRIENDS */}
        <SectionCard
          title="Friends" subtitle="Online status" icon={Users} image="/friends.jpg"
          items={allContacts}
          renderItem={(item) => <FriendItem key={item._id} friend={item} />}
        />
      </div>
    </div>
  );
}