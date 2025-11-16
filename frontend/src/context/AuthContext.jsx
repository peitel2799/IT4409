/* GỌI API THẬT */

// import { createContext, useContext, useState, useEffect } from "react";
// import { axiosInstance } from "../lib/axios";
// import toast from "react-hot-toast";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authUser, setAuthUser] = useState(null); 
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
//   const [isSigningUp, setIsSigningUp] = useState(false); 
//   const [isLoggingIn, setIsLoggingIn] = useState(false); 
  
//   // THÊM: State cho update profile
//   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     setIsCheckingAuth(true);
//     try {
//       const res = await axiosInstance.get("/auth/check");
//       setAuthUser(res.data);
//     } catch (error) {
//       console.log("Error checking auth:", error);
//       setAuthUser(null);
//     } finally {
//       setIsCheckingAuth(false);
//     }
//   };

//   const signup = async (data) => {
//     setIsSigningUp(true);
//     try {
//       const res = await axiosInstance.post("/auth/signup", data);
//       setAuthUser(res.data);
//       toast.success("Account created successfully!");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Signup failed");
//       throw error;
//     } finally {
//       setIsSigningUp(false);
//     }
//   };

//   const login = async (data) => {
//     setIsLoggingIn(true);
//     try {
//       const res = await axiosInstance.post("/auth/login", data);
//       setAuthUser(res.data);
//       toast.success("Logged in successfully!");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed");
//       throw error;
//     } finally {
//       setIsLoggingIn(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       await axiosInstance.post("/auth/logout");
//       setAuthUser(null);
//       toast.success("Logged out successfully");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Logout failed");
//     }
//   };

//   // THÊM: Hàm updateProfile (API Thật)
//   const updateProfile = async (data) => { // 'data' là FormData
//     setIsUpdatingProfile(true);
//     try {
//       const res = await axiosInstance.patch("/auth/profile", data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       // Cập nhật authUser với dữ liệu mới từ server
//       setAuthUser(res.data); 
//       toast.success("Profile updated successfully!");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Update failed");
//       throw error; 
//     } finally {
//       setIsUpdatingProfile(false);
//     }
//   };

//   const value = {
//     authUser,
//     setAuthUser,
//     isCheckingAuth,
//     isSigningUp,
//     isLoggingIn,
//     isUpdatingProfile,
//     signup,
//     login,
//     logout,
//     checkAuth,
//     updateProfile, 
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return context;
// };

/* ==================================================================== */
/* GIẢ LẬP API  */
/* ==================================================================== */

import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios"; // Vẫn import, để dùng khi tắt mock
import toast from "react-hot-toast";

// --- (Phần Mocking Helpers: USE_MOCK_AUTH, wait, loadData, saveData) ---
const USE_MOCK_AUTH = true;
const wait = (ms) => new Promise(res => setTimeout(res, ms));
const loadData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
if (!loadData("mockUsers")) {
  saveData("mockUsers", []); 
}
// -------------------------------------------------------------------

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 1. THÊM STATE MỚI
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // --- (Các hàm checkAuth, signup, login, logout) ---
  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      if (USE_MOCK_AUTH) {
        await wait(200);
        const currentUser = loadData("currentUser"); 
        setAuthUser(currentUser);
      } else {
        const res = await axiosInstance.get("/auth/check");
        setAuthUser(res.data);
      }
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
      if (USE_MOCK_AUTH) {
        await wait(500);
        const mockUsers = loadData("mockUsers") || [];
        if (mockUsers.some(u => u.email === data.email)) {
          throw new Error("Email already exists");
        }
        const newUser = {
          _id: Date.now().toString(),
          fullName: data.fullName,
          email: data.email,
          password: data.password, 
          avatar: null, // Avatar ban đầu là null
          createdAt: new Date().toISOString(),
        };
        saveData("mockUsers", [...mockUsers, newUser]);
        saveData("currentUser", newUser);
        setAuthUser(newUser);
        toast.success("Account created successfully!");
      } else {
        const res = await axiosInstance.post("/auth/signup", data);
        setAuthUser(res.data);
        toast.success("Account created successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Signup failed");
      throw error;
    } finally {
      setIsSigningUp(false);
    }
  };

  const login = async (data) => {
    setIsLoggingIn(true);
    try {
      if (USE_MOCK_AUTH) {
        await wait(500);
        const mockUsers = loadData("mockUsers") || [];
        const user = mockUsers.find(u => u.email === data.email);
        if (!user || user.password !== data.password) {
          throw new Error("Invalid email or password");
        }
        saveData("currentUser", user);
        setAuthUser(user);
        toast.success("Logged in successfully!");
      } else {
        const res = await axiosInstance.post("/auth/login", data);
        setAuthUser(res.data);
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      if (USE_MOCK_AUTH) {
        await wait(200);
        saveData("currentUser", null);
        setAuthUser(null);
        toast.success("Logged out successfully");
      } else {
        await axiosInstance.post("/auth/logout");
        setAuthUser(null);
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Logout failed");
    }
  };


  const updateProfile = async (data) => { // 'data' là FormData
    setIsUpdatingProfile(true);
    try {
      if (USE_MOCK_AUTH) {
        await wait(1000); // Giả lập thời gian upload
        
        // Đọc FormData (cách đơn giản)
        const newFullName = data.get('fullName');
        const newAvatarFile = data.get('avatar');
        
        const currentUser = loadData("currentUser");
        
        // Tạo URL giả lập cho avatar nếu có file mới
        let newAvatarUrl = currentUser.avatar;
        if (newAvatarFile) {
          // Tạo một URL (giả) cho avatar mới. 
          // Trình duyệt sẽ không giữ cái này
          newAvatarUrl = URL.createObjectURL(newAvatarFile); 
        }

        const updatedUser = {
           ...currentUser,
           fullName: newFullName || currentUser.fullName,
           avatar: newAvatarUrl,
        };
        
        saveData("currentUser", updatedUser); // Lưu user mới vào session
        
        // Cập nhật lại "database" mockUsers
        const mockUsers = loadData("mockUsers") || [];
        const updatedUsers = mockUsers.map(u => 
          u._id === updatedUser._id ? updatedUser : u
        );
        saveData("mockUsers", updatedUsers);

        setAuthUser(updatedUser); // Cập nhật state
        
        toast.success("Profile updated successfully! (Mock)");

      } else {
        // ---- DÙNG API THẬT ----
        const res = await axiosInstance.patch("/auth/profile", data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAuthUser(res.data);
        toast.success("Profile updated successfully!");
      }
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