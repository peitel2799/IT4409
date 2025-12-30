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

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  // --- STATE ---
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isGroupMessagesLoading, setIsGroupMessagesLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { groupId: [{ userId, fullName }] }

  const { authUser } = useAuth();
  const { socket } = useSocket();

  // --- FETCH FUNCTIONS ---

  /**
   * Get all groups for current user
   */
  const getGroups = useCallback(async () => {
    setIsGroupsLoading(true);
    try {
      const res = await axiosInstance.get("/groups");
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load groups"
      );
    } finally {
      setIsGroupsLoading(false);
    }
  }, []);

  /**
   * Get a specific group by ID
   */
  const getGroupById = useCallback(async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to load group"
      );
      return null;
    }
  }, []);

  /**
   * Get messages for a specific group
   */
  const getGroupMessages = useCallback(async (groupId) => {
    if (!groupId) {
      setGroupMessages([]);
      return;
    }

    setIsGroupMessagesLoading(true);
    setGroupMessages([]);

    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      setGroupMessages(Array.isArray(res.data) ? res.data : []);

      // Mark messages as read
      await axiosInstance.post(`/messages/group/${groupId}/read`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load group messages"
      );
    } finally {
      setIsGroupMessagesLoading(false);
    }
  }, []);

  // --- ACTION FUNCTIONS ---

  /**
   * Create a new group
   */
  const createGroup = useCallback(
    async (formData) => {
      // formData should contain: name, description (optional), memberIds, avatar (optional)
      setIsCreatingGroup(true);
      try {
        const res = await axiosInstance.post("/groups", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const newGroup = res.data;
        setGroups((prev) => [newGroup, ...prev]);

        // Join the socket room for this new group
        if (socket) {
          socket.emit("group:join", { groupId: newGroup._id });
        }

        toast.success("Group created successfully!");
        return newGroup;
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to create group"
        );
        throw error;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [socket]
  );

  /**
   * Send a message to a group
   */
  const sendGroupMessage = useCallback(async (groupId, formData) => {
    const text = formData.get("text");
    const imageFile = formData.get("image");

    if (!text && !imageFile) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/group/${groupId}/send`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Message will be added via socket event (group:newMessage)
      // But we can also add it optimistically here
      const newMessage = res.data;
      setGroupMessages((prev) => [...prev, newMessage]);

      // Update group's last activity (move to top)
      setGroups((prev) => {
        const updatedGroups = prev.map((group) =>
          group._id === groupId
            ? { ...group, updatedAt: new Date().toISOString() }
            : group
        );
        return updatedGroups.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });

      return newMessage;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send message"
      );
      throw error;
    }
  }, []);

  /**
   * React to a message in a group
   */
  const reactToGroupMessage = useCallback(async (messageId, emoji) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}/react`, {
        emoji,
      });
      const updatedMessage = res.data;

      setGroupMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, reactions: updatedMessage.reactions }
            : msg
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to react to message"
      );
    }
  }, []);

  /**
   * Mark group messages as read
   */
  const markGroupAsRead = useCallback(
    async (groupId) => {
      try {
        await axiosInstance.post(`/messages/group/${groupId}/read`);

        // Emit socket event to notify others
        if (socket) {
          socket.emit("group:markAsRead", { groupId });
        }
      } catch (error) {
        console.error("Error marking group messages as read:", error);
      }
    },
    [socket]
  );

  /**
   * Emit typing event for group
   */
  const emitGroupTyping = useCallback(
    (groupId) => {
      if (socket && groupId) {
        socket.emit("group:typing", { groupId });
      }
    },
    [socket]
  );

  /**
   * Emit stop typing event for group
   */
  const stopGroupTyping = useCallback(
    (groupId) => {
      if (socket && groupId) {
        socket.emit("group:stop-typing", { groupId });
      }
    },
    [socket]
  );

  // --- EFFECTS ---

  // Load groups when user logs in
  useEffect(() => {
    if (authUser) {
      getGroups();
    }
  }, [authUser, getGroups]);

  // Setup socket listeners for group events
  useEffect(() => {
    if (!socket || !authUser) return;

    // New message in a group
    const handleNewGroupMessage = ({ groupId, message }) => {
      // Only add if we're viewing this group
      if (selectedGroup && selectedGroup._id === groupId) {
        setGroupMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Mark as read if we're viewing
        markGroupAsRead(groupId);
      }

      // Update group's position in list (most recent first)
      setGroups((prev) => {
        const updatedGroups = prev.map((group) =>
          group._id === groupId
            ? {
                ...group,
                updatedAt: new Date().toISOString(),
                lastMessage: message.text || "Sent an image",
              }
            : group
        );
        return updatedGroups.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    // Typing indicator
    const handleGroupTyping = ({ groupId, userId, userInfo }) => {
      if (userId === authUser._id) return; // Ignore own typing

      setTypingUsers((prev) => {
        const groupTyping = prev[groupId] || [];
        if (groupTyping.some((u) => u.userId === userId)) return prev;
        return {
          ...prev,
          [groupId]: [...groupTyping, { userId, ...userInfo }],
        };
      });
    };

    // Stop typing
    const handleGroupStopTyping = ({ groupId, userId }) => {
      setTypingUsers((prev) => {
        const groupTyping = prev[groupId] || [];
        return {
          ...prev,
          [groupId]: groupTyping.filter((u) => u.userId !== userId),
        };
      });
    };

    // Messages read by someone
    const handleGroupMessagesRead = ({ groupId, readBy }) => {
      if (readBy === authUser._id) return;
      // Could update read receipts UI here if needed
    };

    // Reaction on a group message
    const handleGroupMessageReaction = ({ groupId, message }) => {
      if (selectedGroup && selectedGroup._id === groupId) {
        setGroupMessages((prev) =>
          prev.map((msg) =>
            msg._id === message._id
              ? { ...msg, reactions: message.reactions }
              : msg
          )
        );
      }
    };

    // Joined a group successfully
    const handleGroupJoined = ({ groupId }) => {
      console.log(`Joined group room: ${groupId}`);
    };

    // Group error
    const handleGroupError = ({ message }) => {
      toast.error(message);
    };

    // Register listeners
    socket.on("group:newMessage", handleNewGroupMessage);
    socket.on("group:typing", handleGroupTyping);
    socket.on("group:stop-typing", handleGroupStopTyping);
    socket.on("group:messagesRead", handleGroupMessagesRead);
    socket.on("group:messageReaction", handleGroupMessageReaction);
    socket.on("group:joined", handleGroupJoined);
    socket.on("group:error", handleGroupError);

    return () => {
      socket.off("group:newMessage", handleNewGroupMessage);
      socket.off("group:typing", handleGroupTyping);
      socket.off("group:stop-typing", handleGroupStopTyping);
      socket.off("group:messagesRead", handleGroupMessagesRead);
      socket.off("group:messageReaction", handleGroupMessageReaction);
      socket.off("group:joined", handleGroupJoined);
      socket.off("group:error", handleGroupError);
    };
  }, [socket, authUser, selectedGroup, markGroupAsRead]);

  // --- CONTEXT VALUE ---
  const value = {
    // Groups
    groups,
    selectedGroup,
    setSelectedGroup,
    isGroupsLoading,
    getGroups,
    getGroupById,
    createGroup,
    isCreatingGroup,

    // Group Messages
    groupMessages,
    isGroupMessagesLoading,
    getGroupMessages,
    sendGroupMessage,
    reactToGroupMessage,
    markGroupAsRead,

    // Typing
    typingUsers,
    emitGroupTyping,
    stopGroupTyping,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within GroupProvider");
  }
  return context;
};
