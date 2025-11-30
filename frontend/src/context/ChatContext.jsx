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
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [allContacts, setAllContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    () => JSON.parse(localStorage.getItem("isSoundEnabled")) === true
  );
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);
  const { authUser } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (authUser) {
      const BASE_URL =
        import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
      const newSocket = io(BASE_URL, {
        withCredentials: true,
      });

      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });

      newSocket.on("receiveMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (isSoundEnabled) {
          // Play notification sound if enabled
        }
      });

      newSocket.on("messagesRead", (data) => {
        // Update UI to show messages are read
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === authUser._id && msg.receiverId === data.partnerId
              ? { ...msg, isRead: true }
              : msg
          )
        );
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [authUser, isSoundEnabled]);

  const toggleSound = useCallback(() => {
    const newSoundState = !isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newSoundState);
    setIsSoundEnabled(newSoundState);
  }, [isSoundEnabled]);

  const customSetActiveTab = (tab) => setActiveTab(tab);
  const customSetSelectedUser = (user) => setSelectedUser(user);

  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    setAllContacts([]);
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

  const getMyChatPartners = useCallback(async () => {
    setIsUsersLoading(true);
    setChats([]);
    try {
      const res = await axiosInstance.get("/messages/chats");
      setChats(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to load chats"
      );
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

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

      if (socket) {
        socket.emit("sendMessage", {
          receiverId,
          text,
          image,
        });
      }
    },
    [socket]
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

  const getFriendRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      setFriendRequests(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load friend requests"
      );
    }
  }, []);

  const getFriends = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/friends/list");
      setFriends(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load friends"
      );
    }
  }, []);

  // Load friends and friend requests when authUser changes
  useEffect(() => {
    if (authUser) {
      getFriends();
      getFriendRequests();
    }
  }, [authUser, getFriends, getFriendRequests]);

  // Setup friend request socket listeners
  useEffect(() => {
    if (socket && authUser) {
      socket.on("friendRequestReceived", async () => {
        await getFriendRequests();
      });

      socket.on("friendRequestAccepted", async () => {
        await Promise.all([getFriends(), getFriendRequests()]);
      });

      return () => {
        socket.off("friendRequestReceived");
        socket.off("friendRequestAccepted");
      };
    }
  }, [socket, authUser, getFriends, getFriendRequests]);

  const searchUsers = useCallback(async (keyword) => {
    const res = await axiosInstance.get("/friends/search", {
      params: { q: keyword },
    });
    return res.data;
  }, []);

  const sendFriendRequest = useCallback(
    async (userId) => {
      try {
        setIsFriendActionLoading(true);
        const res = await axiosInstance.post(`/friends/request/${userId}`);
        toast.success("Friend request sent successfully");
        await Promise.all([getFriendRequests(), getFriends()]);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to send friend request"
        );
        throw error;
      } finally {
        setIsFriendActionLoading(false);
      }
    },
    [getFriendRequests, getFriends]
  );

  const acceptFriendRequest = useCallback(
    async (userId) => {
      try {
        setIsFriendActionLoading(true);
        const res = await axiosInstance.post(`/friends/accept/${userId}`);
        toast.success("Friend request accepted successfully");
        await Promise.all([getFriendRequests(), getFriends()]);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to accept friend request"
        );
        throw error;
      } finally {
        setIsFriendActionLoading(false);
      }
    },
    [getFriendRequests, getFriends]
  );

  const rejectFriendRequest = useCallback(
    async (userId) => {
      try {
        setIsFriendActionLoading(true);
        const res = await axiosInstance.post(`/friends/reject/${userId}`);
        toast.success("Friend request rejected successfully");
        await getFriendRequests();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to reject friend request"
        );
        throw error;
      } finally {
        setIsFriendActionLoading(false);
      }
    },
    [getFriendRequests]
  );
  const cancelFriendRequest = useCallback(
    async (userId) => {
      try {
        setIsFriendActionLoading(true);
        const res = await axiosInstance.post(`/friends/cancel/${userId}`);
        toast.success("Friend request cancelled successfully");
        await getFriendRequests();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to cancel friend request"
        );
        throw error;
      } finally {
        setIsFriendActionLoading(false);
      }
    },
    [getFriendRequests]
  );
  const removeFriend = useCallback(
    async (userId) => {
      try {
        setIsFriendActionLoading(true);
        const res = await axiosInstance.delete(`/friends/remove/${userId}`);
        toast.success("Friend removed successfully");
        await getFriends();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove friend");
        throw error;
      } finally {
        setIsFriendActionLoading(false);
      }
    },
    [getFriends]
  );

  const value = {
    allContacts,
    chats,
    messages,
    activeTab,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    isSoundEnabled,
    socket,
    onlineUsers,
    toggleSound,
    setActiveTab: customSetActiveTab,
    setSelectedUser: customSetSelectedUser,
    getAllContacts,
    getMyChatPartners,
    getMessagesByUserId,
    sendMessage,
    markAsRead,
    friends,
    friendRequests,
    isFriendActionLoading,
    getFriends,
    getFriendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat phải được dùng bên trong ChatProvider");
  }
  return context;
};
