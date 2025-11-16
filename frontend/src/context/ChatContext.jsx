// import { createContext, useContext, useState, useCallback } from "react";
// import { axiosInstance } from "../lib/axios";
// import toast from "react-hot-toast";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [allContacts, setAllContacts] = useState([]);
//   const [chats, setChats] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [activeTab, setActiveTab] = useState("chats"); // "chats" | "friends"
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isUsersLoading, setIsUsersLoading] = useState(false);
//   const [isMessagesLoading, setIsMessagesLoading] = useState(false);
//   const [showFriendModal, setShowFriendModal] = useState(false);
//   const [isSoundEnabled, setIsSoundEnabled] = useState(
//     () => JSON.parse(localStorage.getItem("isSoundEnabled")) === true
//   );

//   const toggleSound = useCallback(() => {
//     const newState = !isSoundEnabled;
//     localStorage.setItem("isSoundEnabled", newState);
//     setIsSoundEnabled(newState);
//   }, [isSoundEnabled]);

//   const openFriendModal = () => setShowFriendModal(true);
//   const closeFriendModal = () => setShowFriendModal(false);

//   const getAllContacts = useCallback(async () => {
//     setIsUsersLoading(true);
//     setAllContacts([]);
//     try {
//       const res = await axiosInstance.get("/messages/contacts");
//       setAllContacts(res.data);
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message || "Failed to load contacts");
//     } finally {
//       setIsUsersLoading(false);
//     }
//   }, []);

//   const getMyChatPartners = useCallback(async () => {
//     setIsUsersLoading(true);
//     setChats([]);
//     try {
//       const res = await axiosInstance.get("/messages/chats");
//       setChats(res.data);
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message || "Failed to load chats");
//     } finally {
//       setIsUsersLoading(false);
//     }
//   }, []);

//   const getMessagesByUserId = useCallback(async (userId) => {
//     setIsMessagesLoading(true);
//     setMessages([]);
//     if (!userId) {
//       setIsMessagesLoading(false);
//       return;
//     }
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       setMessages(res.data);
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message || "Failed to load messages");
//     } finally {
//       setIsMessagesLoading(false);
//     }
//   }, []);

//   const onChatSelect = (chat) => {
//     // Nếu chưa có, thêm tạm thời
//     if (!chats.find(c => c.id === chat.id)) {
//       setChats(prev => [...prev, chat]);
//     }
//     setSelectedUser(chat);
//     setActiveTab("chats");
//     closeFriendModal(); // tự động đóng modal khi chọn chat
//   };

//   return (
//     <ChatContext.Provider
//       value={{
//         allContacts,
//         chats,
//         messages,
//         activeTab,
//         selectedUser,
//         isUsersLoading,
//         isMessagesLoading,
//         isSoundEnabled,
//         showFriendModal,

//         toggleSound,
//         setActiveTab,
//         setSelectedUser,
//         openFriendModal,
//         closeFriendModal,
//         getAllContacts,
//         getMyChatPartners,
//         getMessagesByUserId,
//         onChatSelect,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => {
//   const context = useContext(ChatContext);
//   if (!context) throw new Error("useChat phải được dùng trong ChatProvider");
//   return context;
// };

/*Giả lập dữ liệu*/
import { 
  createContext, 
  useContext, 
  useState, 
  useCallback 
} from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";


const USE_MOCK_DATA = true;

// Dữ liệu giả cho friends
const DUMMY_CONTACTS = [
  { _id: "user1", fullName: "Alice", email: "alice@example.com", avatar: "/images.jpg" },
  { _id: "user2", fullName: "Bob", email: "bob@example.com", avatar: "/images.jpg" },
  { _id: "user3", fullName: "Charlie", email: "charlie@example.com", avatar: "/images.jpg" },
];

// Dữ liệu giả cho danh sách hội thoại (Chats)
const DUMMY_CHATS = [
  { 
    id: "user1", // ID này phải khớp với ID của DUMMY_MESSAGES
    name: "Alice", 
    avatar: "/images.jpg", 
    lastMessage: "OK, hẹn gặp lại!", 
    time: "10:30 AM", 
    unread: 2 
  },
  { 
    id: "user2", 
    name: "Bob", 
    avatar: "/images.jpg", 
    lastMessage: "Bạn đang làm gì vậy?", 
    time: "Hôm qua", 
    unread: 0
  },
];

// Dữ liệu giả cho Tin nhắn (Messages)
// Key (ví dụ "user1") phải khớp với 'id' của DUMMY_CHATS
const DUMMY_MESSAGES = {
  "user1": [
    { id: "m1", senderId: "user1", text: "Chào bạn, khỏe không?", time: "2025-11-12T10:30:00" },
    { id: "m2", senderId: 0, text: "Chào Alice, mình khỏe!", time: "2025-11-12T10:31:00" }, // senderId: 0 là "tôi"
    { id: "m3", senderId: "user1", text: "OK, hẹn gặp lại!", time: "2025-11-12T10:32:00" },
  ],
  "user2": [
    { id: "m4", senderId: "user2", text: "Bạn đang làm gì vậy?", time: "2025-11-11T15:00:00" },
  ],
};
// -------------------------------------------------------------------

const ChatContext = createContext();

// Hàm giả lập độ trễ mạng
const wait = (ms) => new Promise(res => setTimeout(res, ms));

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

  // -------------------------------------------------------------------
  // BƯỚC 2: SỬA ĐỔI CÁC HÀM GỌI API
  // -------------------------------------------------------------------

  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    setAllContacts([]);
    try {
      if (USE_MOCK_DATA) {
        // ---- DÙNG DATA GIẢ ----
        await wait(500); // Giả lập thời gian tải
        setAllContacts(DUMMY_CONTACTS);
      } else {
        // ---- DÙNG API THẬT ----
        const res = await axiosInstance.get("/messages/contacts"); 
        setAllContacts(res.data);
      }
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
      if (USE_MOCK_DATA) {
        // ---- DÙNG DATA GIẢ ----
        await wait(500); // Giả lập thời gian tải
        setChats(DUMMY_CHATS);
      } else {
        // ---- DÙNG API THẬT ----
        const res = await axiosInstance.get("/messages/chats"); 
        setChats(res.data);
      }
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
      if (USE_MOCK_DATA) {
        // ---- DÙNG DATA GIẢ ----
        await wait(300); // Giả lập thời gian tải
        const mockMsgs = DUMMY_MESSAGES[userId] || [];
        setMessages(mockMsgs);
      } else {
        // ---- DÙNG API THẬT ----
        const res = await axiosInstance.get(`/messages/${userId}`); 
        setMessages(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  // ... (Phần 'value' và 'useChat' giữ nguyên) ...
  const value = {
    allContacts,
    chats,
    messages,
    activeTab,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    isSoundEnabled,
    
    // Actions
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