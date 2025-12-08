import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuth();

    // Initialize socket connection when user is authenticated
    useEffect(() => {
        if (authUser) {
            const BASE_URL =
                import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

            const newSocket = io(BASE_URL, {
                withCredentials: true,
                transports: ["websocket", "polling"],
            });

            newSocket.on("getOnlineUsers", (userIds) => {
                setOnlineUsers(userIds);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else {
            // Disconnect socket when user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [authUser]);

    const value = {
        socket,
        onlineUsers,
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
