import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setIsCheckingAuth(true);
        try {
            const res = await axiosInstance.get("/auth/check");
            setAuthUser(res.data);
        } catch (error) {
            console.log("Error checking auth:", error);
            setAuthUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const signup = async (data) => {
        setIsSigningUp(true);
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            console.log("Signup successful:", res.data);
            setAuthUser(res.data);
            toast.success("Account created successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            throw error;
        } finally {
            setIsSigningUp(false);
        }
    };

    const login = async (data) => {
        setIsLoggingIn(true);
        try {
            const res = await axiosInstance.post("/auth/login", data);
            console.log("Login successful:", res.data);
            setAuthUser(res.data);
            toast.success("Logged in successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            throw error;
        } finally {
            setIsLoggingIn(false);
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            console.log("Logout successful");
            setAuthUser(null);
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    };

    const updateProfile = async (data) => {
        setIsUpdatingProfile(true);
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            console.log("Profile update successful:", res.data);
            setAuthUser(res.data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
            throw error;
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const value = {
        authUser,
        setAuthUser,
        isCheckingAuth,
        isSigningUp,
        isLoggingIn,
        isUpdatingProfile,
        signup,
        login,
        logout,
        checkAuth,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
