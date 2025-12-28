import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const { authUser } = useAuth();
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (authUser) {
            const BASE_URL =
                import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

            const newSocket = io(BASE_URL, {
                withCredentials: true,
                transports: ["websocket", "polling"],
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                setIsConnected(true);
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            newSocket.on("getOnlineUsers", (userIds) => {
                setOnlineUsers(userIds);
            });

            newSocket.on("user:typing", ({ senderId }) => {
                setTypingUsers(prev => ({ ...prev, [senderId]: true }));
            });

            newSocket.on("user:stop-typing", ({ senderId }) => {
                setTypingUsers(prev => {
                    const updated = { ...prev };
                    delete updated[senderId];
                    return updated;
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [authUser]);

    const emitTyping = useCallback((receiverId) => {
        if (!socket) return;

        socket.emit("user:typing", { receiverId });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("user:stop-typing", { receiverId });
        }, 2000);
    }, [socket]);

    const stopTyping = useCallback((receiverId) => {
        if (!socket) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        socket.emit("user:stop-typing", { receiverId });
    }, [socket]);

    const value = {
        socket,
        onlineUsers,
        isConnected,
        typingUsers,
        emitTyping,
        stopTyping,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};
