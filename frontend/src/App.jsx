import { Routes, Route, Navigate } from "react-router-dom";
import { LoaderIcon } from "lucide-react"; // Import icon loading
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import CallPage from "./pages/CallPage";
import ForgotPasswordPage from "./pages/ForgetPasswordPage";
import HomeDashboard from "./components/features/home/HomeDashboard";
import CallsDashboard from "./components/features/calls/CallsDashboard";
import FriendsDashboard from "./components/features/friends/FriendsDashboard";
import ChatDashboard from "./components/features/chat/ChatDashboard";
import SettingsDashboard from "./components/features/settings/SettingsDashboard";
import { useAuth } from "./context/AuthContext";
import AuthLayout from './layouts/AuthLayout';
import FriendsList from "./components/features/friends/FriendsList";
import SentRequests from "./components/features/friends/SentRequests";
function App() {
  const { authUser, isCheckingAuth } = useAuth();

  //Chặn render router khi đang kiểm tra đăng nhập
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#F2F0E9]">
        <LoaderIcon className="w-10 h-10 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/chat" />} />
          <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/chat" />} />
        </Route>



        <Route
          path="/call-window"
          element={authUser ? <CallPage /> : <Navigate to="/login" />}
        />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} >
          {/* Mặc định vào /chat sẽ chuyển hướng sang /chat/home */}
          <Route index element={<Navigate to="home" replace />} />

          {/* Các Route con */}
          <Route path="home" element={<HomeDashboard />} />
          <Route path="messages" element={<ChatDashboard />} />
          <Route path="friends" element={<FriendsDashboard />}>
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<FriendsList type="all" />} />
            <Route path="online" element={<FriendsList type="online" />} />
            <Route path="requests" element={<FriendsList type="requests" />} />
            <Route path="sent" element={<SentRequests />} />
          </Route>
          <Route path="calls" element={<CallsDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;