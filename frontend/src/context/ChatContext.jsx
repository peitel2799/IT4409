import { createContext, useContext, useState, useCallback } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Import dữ liệu giả từ file trung tâm
import * as MockData from "../lib/mockData";

const ChatContext = createContext();

// =========================================================
// CỜ BẬT/TẮT CHẾ ĐỘ GIẢ LẬP
const USE_MOCK_DATA = true; 
// =========================================================

export const ChatProvider = ({ children }) => {
  // --- STATE ---
  const [allContacts, setAllContacts] = useState([]);
  const [homeStats, setHomeStats] = useState({ calls: [], chats: [], notes: [] });
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // <--- STATE MỚI
  const [messages, setMessages] = useState([]);
  
  // State UI
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // ... (Giữ nguyên các hàm getAllContacts, getHomeStats, getFriendRequests) ...
  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await wait(500); 
        setAllContacts(MockData.MOCK_CONTACTS);
      } else {
        const res = await axiosInstance.get("/messages/contacts");
        setAllContacts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const getHomeStats = useCallback(async () => {
    try {
        if (USE_MOCK_DATA) {
            await wait(300);
            setHomeStats(MockData.MOCK_HOME_STATS);
        } else {
            // API calls
        }
    } catch (error) {
        console.error(error);
    }
  }, []);

  const getFriendRequests = useCallback(async () => {
    try {
      if(USE_MOCK_DATA) {
          setFriendRequests(MockData.MOCK_REQUESTS);
      } else {
          const res = await axiosInstance.get("/friends/requests");
          setFriendRequests(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // ------------------------------------------------------------------
  // (MỚI) LẤY DANH SÁCH LỜI MỜI ĐÃ GỬI
  // ------------------------------------------------------------------
  const getSentRequests = useCallback(async () => {
    try {
      if (USE_MOCK_DATA) {
        // Lấy từ MockData.MOCK_SENT_REQUESTS (Bạn nhớ thêm vào file mockData.js nhé)
        setSentRequests(MockData.MOCK_SENT_REQUESTS || []);
      } else {
        const res = await axiosInstance.get("/friends/requests/sent");
        setSentRequests(res.data);
      }
    } catch (error) {
      console.error("Failed to load sent requests", error);
    }
  }, []);

  // ... (Giữ nguyên getMessages, sendMessage) ...
  const getMessages = useCallback(async (userId) => {
    setIsMessagesLoading(true);
    setMessages([]); 
    if (!userId) {
      setIsMessagesLoading(false);
      return;
    }
    try {
      if (USE_MOCK_DATA) {
        await wait(400);
        const msgs = MockData.MOCK_MESSAGES[userId] || [];
        setMessages(msgs);
      } else {
        const res = await axiosInstance.get(`/messages/${userId}`);
        setMessages(res.data);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const sendMessage = async (messageData) => {
    try {
      if (USE_MOCK_DATA) {
         const newMessage = {
            _id: Date.now(),
            senderId: "me",
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString()
         };
         setMessages((prev) => [...prev, newMessage]);
      } else {
         const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
         setMessages((prev) => [...prev, res.data]);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const value = {
    allContacts,
    homeStats,
    friendRequests,
    sentRequests, // <--- Export State
    messages,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    
    setSelectedUser,
    getAllContacts,
    getHomeStats,
    getFriendRequests,
    getSentRequests, // <--- Export Function
    getMessages,
    sendMessage
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