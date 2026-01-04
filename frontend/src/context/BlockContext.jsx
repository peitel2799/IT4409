import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const BlockContext = createContext();

export const useBlock = () => {
    const context = useContext(BlockContext);
    if (!context) {
        throw new Error("useBlock must be used within a BlockProvider");
    }
    return context;
};

export const BlockProvider = ({ children }) => {
    const { authUser } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch blocked users
    const fetchBlockedUsers = useCallback(async () => {
        if (!authUser) return;

        try {
            const response = await axiosInstance.get("/block/list");
            setBlockedUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching blocked users:", error);
        }
    }, [authUser]);

    // Block a user
    const blockUser = useCallback(
        async (userId) => {
            setIsLoading(true);
            try {
                await axiosInstance.post(`/block/block/${userId}`);
                toast.success("User blocked successfully");
                await fetchBlockedUsers();
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Failed to block user"
                );
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchBlockedUsers]
    );

    // Unblock a user
    const unblockUser = useCallback(
        async (userId) => {
            setIsLoading(true);
            try {
                await axiosInstance.post(`/block/unblock/${userId}`);
                toast.success("User unblocked successfully");
                await fetchBlockedUsers();
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Failed to unblock user"
                );
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchBlockedUsers]
    );

    // Check if a user is blocked
    const isUserBlocked = useCallback(
        (userId) => {
            return blockedUsers.some((blocked) => blocked._id === userId);
        },
        [blockedUsers]
    );

    // Fetch blocked users on mount
    useEffect(() => {
        if (authUser) {
            fetchBlockedUsers();
        }
    }, [authUser, fetchBlockedUsers]);

    const value = {
        blockedUsers,
        isLoading,
        blockUser,
        unblockUser,
        isUserBlocked,
        fetchBlockedUsers,
    };

    return <BlockContext.Provider value={value}>{children}</BlockContext.Provider>;
};

export default BlockContext;
