import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios";
import { useChat } from "../../../context/ChatContext";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";

import CallsHeader from "./CallsHeader";
import CallsList from "./CallsList";

export default function CallsDashboard() {
  const navigate = useNavigate();
  const { setSelectedUser } = useChat();
  const { socket } = useSocket();
  const { authUser } = useAuth();

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch call history from API
  const fetchCallHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/calls/history");
      if (response.data.success) {
        setCalls(response.data.calls);
      }
    } catch (error) {
      console.error("Error fetching call history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  // Filter calls
  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.contact?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === "missed") {
      matchesFilter = call.status === "missed" || call.status === "rejected" || call.status === "busy" || call.status === "unavailable";
    } else if (filter === "incoming") {
      matchesFilter = call.direction === "incoming" && call.status === "answered";
    } else if (filter === "outgoing") {
      matchesFilter = call.direction === "outgoing" && call.status === "answered";
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleMessage = (call) => {
    setSelectedUser({ 
      id: call.contact._id, 
      name: call.contact.fullName, 
      avatar: call.contact.profilePic 
    });
    navigate("/chat/messages");
  };

  const openCallWindow = (contact, isVideo) => {
    // Emit call:initiate from main window
    if (socket && authUser) {
      socket.emit("call:initiate", {
        receiverId: contact._id,
        callerInfo: {
          id: authUser._id,
          name: authUser.fullName,
          avatar: authUser.profilePic,
        },
        isVideo,
      });
    }

    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const avatarUrl = contact.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName)}`;

    const params = new URLSearchParams({
      name: contact.fullName,
      avatar: avatarUrl,
      id: contact._id,
      video: isVideo ? "true" : "false",
      caller: "true"
    });

    window.open(
      `/call-window?${params.toString()}`,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );
  };

  return (
    <>
      <CallsHeader 
        filter={filter} 
        setFilter={setFilter} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      <div className="scroll-area">
        <CallsList 
          calls={filteredCalls}
          loading={loading}
          onMessage={handleMessage} 
          onCall={(call) => openCallWindow(call.contact, false)}
          onVideo={(call) => openCallWindow(call.contact, true)}
        />
      </div>
    </>
  );
}
