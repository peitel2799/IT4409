import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
} from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // --- STATE ---
    const [allContacts, setAllContacts] = useState([]);
    const [homeStats, setHomeStats] = useState({ calls: [], chats: [], notes: [] });
    const [messages, setMessages] = useState([]);

    // UI State
    const [selectedUser, _setSelectedUser] = useState(null);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(
        () => JSON.parse(localStorage.getItem("isSoundEnabled")) === true
    );

    const { authUser } = useAuth();
    const { socket } = useSocket();

    //HỘI THOẠI ẢO
    const setSelectedUser = useCallback((user) => {
        _setSelectedUser(user);
        if (!user) return;

        // Cập nhật Sidebar ngay lập tức để hiện tên người vừa nhấn chat
        setHomeStats((prev) => {
            const isExist = prev.chats.some((chat) => chat._id === user._id);
            
            if (!isExist) {
                // Tạo một hội thoại tạm thời nếu chưa có trong danh sách
                const newChatEntry = {
                    ...user,
                    _id: user._id,
                    fullName: user.fullName || user.username || "Unknown",
                    profilePic: user.profilePic || user.avatar,
                    lastMessage: "", 
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0,
                    isOnline: user.isOnline || false,
                    isSelfChat: authUser?._id === user._id
                };
                
                return {
                    ...prev,
                    chats: [newChatEntry, ...prev.chats] // Đưa lên đầu danh sách
                };
            }
            return prev;
        });
    }, [authUser]);

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
            // Ensure we always set an array, even if API returns unexpected data
            setAllContacts(Array.isArray(res.data) ? res.data : []);
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
            // Ensure we always have an array, even if API returns unexpected data
            const chatPartners = Array.isArray(res.data) ? res.data : [];

            // Transform chat partners into the format expected by ConversationSidebar
            const chats = chatPartners.map((partner) => {
                // Check if this is a self-chat (My Cloud)
                //console.log("Dữ liệu partner từ API:", partner);
                const isSelfChat = authUser && partner._id === authUser._id;

                return {
                    ...partner,
                    name: isSelfChat ? "My Cloud" : (partner.fullName || partner.username || "Unknown"),
                    avatar: isSelfChat
                        ? "https://cdn-icons-png.flaticon.com/512/4144/4144099.png" // Cloud icon
                        : (partner.avatar || partner.profilePic || "https://ui-avatars.com/api/?name=" + encodeURIComponent(partner.fullName || partner.username || "U")),
                    lastMessage: partner.lastMessage || "",
                    time: formatTimeAgo(partner.lastMessageTime),
                    unreadCount: partner.unreadCount || 0,
                    isOnline: isSelfChat ? true : (partner.isOnline || false), // My Cloud is always "available"
                    isSelfChat: isSelfChat, // Flag to identify My Cloud
                };
            });

            setHomeStats({ calls: [], chats, notes: [] });
        } catch (error) {
            console.error("Failed to load home stats:", error);
            setHomeStats({ calls: [], chats: [], notes: [] });
        }
    }, [authUser]); // Added authUser dependency

    // --- MESSAGES ---

    //markAsRead để tự động xóa thông báo khi load tin nhắn
    const markAsRead = useCallback(
        async (partnerId) => {
            try {
                await axiosInstance.post(`/messages/read/${partnerId}`);

                // Cập nhật local state ngay lập tức để mất số unread ở sidebar
                setHomeStats((prev) => ({
                    ...prev,
                    chats: prev.chats.map((chat) =>
                        chat._id === partnerId ? { ...chat, unreadCount: 0 } : chat
                    ),
                }));

                if (socket) {
                    socket.emit("markAsRead", { partnerId });
                }
            } catch (error) {
                console.log("Error marking messages as read:", error);
            }
        },
        [socket]
    );

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
                // Ensure we always set an array, even if API returns unexpected data
                setMessages(Array.isArray(res.data) ? res.data : []);

                //gọi hàm markAsRead() để cập nhật cả Database
                markAsRead(userId);

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
        [markAsRead]
    );

    const sendMessage = useCallback(
        async (receiverId, formData) => {
            // formData contains 'text' and optionally 'image'
            const text = formData.get('text');
            const imageFile = formData.get('image');
            if (!text && !imageFile) {
                toast.error("Message cannot be empty");
                return;
            }

            try {
                const res = await axiosInstance.post(`/messages/send/${receiverId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Optimistically add message to UI
                const newMessage = res.data; //lưu tin nhắn mới vào biến
                setMessages((prev) => [...prev, newMessage]);

                //Cập nhật tin nhắn cuối cùng và sắp xếp lại sidebar khi mình gửi tin
                setHomeStats((prev) => ({
                    ...prev,
                    chats: prev.chats.map((chat) =>
                        chat._id === receiverId
                            ? { ...chat, lastMessage: newMessage.text || "Sent an image", lastMessageTime: newMessage.createdAt }
                            : chat
                    ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)),
                }));

            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to send message"
                );
            }
        },
        [axiosInstance]
    );

    const reactToMessage = useCallback(
        async (messageId, emoji) => {
            try {
                const res = await axiosInstance.put(`/messages/${messageId}/react`, { emoji });
                const updatedMessage = res.data;

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === messageId ? { ...msg, reactions: updatedMessage.reactions } : msg
                    )
                );
            } catch (error) {
                toast.error(
                    error.response?.data?.message || error.message
                );
            }
        },
        []
    );


    // --- SOCKET LISTENERS FOR MESSAGES ---
    useEffect(() => {
        if (socket && authUser) {
            socket.on("newMessage", (message) => {
                //Kiểm tra xem tin nhắn có thuộc về cuộc hội thoại đang mở không
                const senderId = message.senderId?._id || message.senderId;
                const isFromSelectedUser = selectedUser && senderId === selectedUser._id;

                if (isFromSelectedUser) {
                    // Nếu đúng là người đang chat, thêm vào màn hình và đánh dấu đã đọc
                    setMessages((prevMessages) => [...prevMessages, message]);
                    markAsRead(selectedUser._id);
                } else {
                    //tăng unreadCount và đưa chat mới nhất lên đầu
                    setHomeStats((prev) => {
                        const chatExists = prev.chats.find((c) => c._id === senderId);
                        if (chatExists) {
                            const updatedChats = prev.chats.map((chat) =>
                                chat._id === senderId
                                    ? {
                                        ...chat,
                                        unreadCount: (chat.unreadCount || 0) + 1,
                                        lastMessage: message.text,
                                        lastMessageTime: message.createdAt
                                    }
                                    : chat
                            );
                            // Sắp xếp lại để người mới nhắn lên đầu
                            return {
                                ...prev,
                                chats: updatedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
                            };
                        } else {
                            // Nếu là người lạ nhắn tin, gọi lại API để làm mới danh sách 
                            getHomeStats();
                            return prev;
                        }
                    });
                }

                if (isSoundEnabled) {
                    // Play notification sound
                }
            });

            socket.on("messagesRead", (data) => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        (msg.senderId === authUser._id || msg.senderId?._id === authUser._id) &&
                            (msg.receiverId === data.partnerId || msg.receiverId?._id === data.partnerId)
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );
            });

            socket.on("messageReaction", (updatedMessage) => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === updatedMessage._id
                            ? { ...msg, reactions: updatedMessage.reactions }
                            : msg
                    )
                );
            });

            return () => {
                socket.off("newMessage");
                socket.off("messagesRead");
                socket.off("messageReaction");
            };
        }

    }, [socket, authUser, isSoundEnabled, selectedUser, markAsRead, getHomeStats]);
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
        reactToMessage,

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