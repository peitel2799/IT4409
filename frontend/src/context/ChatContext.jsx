import { createContext, useContext, useState, useCallback } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

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
      toast.error(error.response?.data?.message || error.message || "Failed to load contacts");
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
      toast.error(error.response?.data?.message || error.message || "Failed to load chats");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const getMessagesByUserId = useCallback(async (userId) => {
    setIsMessagesLoading(true);
    setMessages([]);
    if (!userId) {
      setIsMessagesLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const value = {
    allContacts,
    chats,
    messages,
    activeTab,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    isSoundEnabled,
    toggleSound,
    setActiveTab: customSetActiveTab,
    setSelectedUser: customSetSelectedUser,
    getAllContacts,
    getMyChatPartners,
    getMessagesByUserId,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat phải được dùng bên trong ChatProvider");
  }
  return context;
};