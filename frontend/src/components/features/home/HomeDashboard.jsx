import React, { useEffect } from 'react';
import { Phone, MessageCircle, Users } from 'lucide-react';
import { useChat } from "../../../context/ChatContext"; 

import DateWidget from './DateWidget';
import NotesWidget from './NotesWidget';
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* CỘT 1 */}
        <div className="flex flex-col gap-4 h-full">
          <DateWidget />
          <NotesWidget data={homeStats.notes} />
        </div>

        {/* CỘT 2: CALLS */}
        <SectionCard 
            title="Calls" subtitle="Recent history" icon={Phone} image="/call.jpg"
            bgColor="bg-pink-300" borderColor="border-pink-100"
            items={homeStats.calls}
            renderItem={(item) => <CallItem key={item.id} call={item} />}
        />

        {/* CỘT 3: CHATS */}
        <SectionCard 
            title="Chats" subtitle="New messages" icon={MessageCircle} image="/chat.jpg"
            bgColor="bg-pink-300" borderColor="border-purple-100" scrollSpeed="40s"
            items={homeStats.chats}
            renderItem={(item) => <ChatItem key={item.id} chat={item} />}
        />

        {/* CỘT 4: FRIENDS */}
        <SectionCard 
            title="Friends" subtitle="Online status" icon={Users} image="/friends.jpg"
            bgColor="bg-purple-200" borderColor="border-purple-100" iconColor="text-purple-600" iconBg="bg-purple-100/80" scrollSpeed="35s"
            items={allContacts}
            renderItem={(item) => <FriendItem key={item._id} friend={item} />}
        />
      </div>
    </div>
  );
}