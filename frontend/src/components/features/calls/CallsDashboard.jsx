import { useState, useEffect } from 'react';
import { useChat } from "../../../context/ChatContext";
import { useNavigate } from "react-router-dom";

import CallsHeader from "./CallsHeader";
import CallsList from "./CallsList";

export default function CallsDashboard() {
  const navigate = useNavigate();
  const { homeStats = {}, getHomeStats, setSelectedUser } = useChat();

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await getHomeStats();
      } catch (err) {
        console.error("Error fetching home stats:", err);
      }
    })();
  }, [getHomeStats]);

  const callsData = homeStats.calls || [];

  const filteredCalls = callsData.filter(call => {
    const matchesSearch = call.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || call.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleMessage = (call) => {
    setSelectedUser({ id: call.id, name: call.name, avatar: call.avatar });
    navigate("/chat/messages");
  };

  const openCallWindow = (user, isVideo) => {
    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const params = new URLSearchParams({
      name: user.name,
      avatar: user.avatar,
      id: user.id,
      video: isVideo ? "true" : "false"
    });

    window.open(
      `/call-window?${params.toString()}`,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );
  };

  return (
    <>
      <CallsHeader filter={filter} setFilter={setFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="scroll-area">
        <CallsList 
          calls={filteredCalls} 
          onMessage={handleMessage} 
          onCall={openCallWindow} 
        />
      </div>
    </>
  );
}
