import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // --- STATE ---
  const [allContacts, setAllContacts] = useState([]);
  const [homeStats, setHomeStats] = useState({ calls: [], chats: [], notes: [] });
  const [messages, setMessages] = useState([]);

  // UI State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    () => JSON.parse(localStorage.getItem("isSoundEnabled")) === true
  );

  const { authUser } = useAuth();
  const { socket } = useSocket();

  // --- SOUND TOGGLE ---
  const toggleSound = useCallback(() => {
    const newSoundState = !isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newSoundState);
    setIsSoundEnabled(newSoundState);
  }, [isSoundEnabled]);

  // --- CONTACTS & STATS ---
  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await axiosInstance.get("/messages/contacts");
      setAllContacts(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to load contacts"
      );
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const getHomeStats = useCallback(async () => {
    // Helper to format time as relative time
    const formatTimeAgo = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    try {
      // Fetch chat partners from the backend
      const res = await axiosInstance.get("/messages/chats");
      const chatPartners = res.data || [];

      // Transform chat partners into the format expected by ConversationSidebar
      const chats = chatPartners.map((partner) => {
        // Check if this is a self-chat (My Cloud)
        const isSelfChat = authUser && partner._id === authUser._id;

        return {
          id: partner._id,
          name: isSelfChat ? "My Cloud" : (partner.fullName || partner.username || "Unknown"),
          avatar: isSelfChat
            ? "https://cdn-icons-png.flaticon.com/512/4144/4144099.png" // Cloud icon
            : (partner.avatar || partner.profilePic || "https://ui-avatars.com/api/?name=" + encodeURIComponent(partner.fullName || partner.username || "U")),
          lastMessage: partner.lastMessage || "",
          time: formatTimeAgo(partner.lastMessageTime),
          unread: partner.unreadCount || 0,
          isOnline: isSelfChat ? true : (partner.isOnline || false), // My Cloud is always "available"
          isSelfChat: isSelfChat, // Flag to identify My Cloud
        };
      });

      setHomeStats({ calls: [], chats, notes: [] });
    } catch (error) {
      console.error("Failed to load home stats:", error);
      setHomeStats({ calls: [], chats: [], notes: [] });
    }
  }, []);

  // --- MESSAGES ---
  const getMessagesByUserId = useCallback(
    async (userId) => {
      setIsMessagesLoading(true);
      setMessages([]);
      if (!userId) {
        setIsMessagesLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        setMessages(res.data);

        // Mark all received messages as read when opening chat
        if (socket) {
          socket.emit("markAsRead", { partnerId: userId });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Failed to load messages"
        );
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [socket]
  );

  const sendMessage = useCallback(
    async (receiverId, text, image = null) => {
      if (!text && !image) {
        toast.error("Message cannot be empty");
        return;
      }

      try {
        const res = await axiosInstance.post(`/messages/send/${receiverId}`, {
          text,
          image,
        });

        // Optimistically add message to UI or let socket handle it
        // If your backend emits 'newMessage' upon saving, you might not need to manually add it here
        // to avoid duplicates if the socket event comes in quickly.
        // However, for immediate feedback, you can add it.
        setMessages((prev) => [...prev, res.data]);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Failed to send message"
        );
      }
    },
    []
  );

  const markAsRead = useCallback(
    async (partnerId) => {
      try {
        await axiosInstance.post(`/messages/read/${partnerId}`);

        if (socket) {
          socket.emit("markAsRead", { partnerId });
        }
      } catch (error) {
        console.log("Error marking messages as read:", error);
      }
    },
    [socket]
  );

  // --- SOCKET LISTENERS FOR MESSAGES ---
  useEffect(() => {
    if (socket && authUser) {
      socket.on("newMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (isSoundEnabled) {
          // Play notification sound if enabled
        }
      });



      socket.on("messagesRead", (data) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === authUser._id && msg.receiverId === data.partnerId
              ? { ...msg, isRead: true }
              : msg
          )
        );
      });

      return () => {
        socket.off("receiveMessage");

        socket.off("messagesRead");
      };
    }
  }, [socket, authUser, isSoundEnabled]);

  const value = {
    // Contacts & Stats
    allContacts,
    homeStats,
    isUsersLoading,
    getAllContacts,
    getHomeStats,

    // Messages
    messages,
    isMessagesLoading,
    getMessagesByUserId,
    sendMessage,
    markAsRead,

    // Selected User
    selectedUser,
    setSelectedUser,

    // Sound
    isSoundEnabled,
    toggleSound,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
