import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext"; // Import file bạn vừa tạo
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import NavigationSidebar from "../components/features/NavigationSidebar";

// Tạo component nội dung để tách biệt với Provider
const ChatPageContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Highlight Sidebar dựa trên URL
  const currentPath = location.pathname.split("/").pop();
  const activePanel = currentPath === "messages" ? "chats" : currentPath;

  // 2. Chuyển hướng URL khi bấm Sidebar
  const handlePanelChange = (panel) => {
    const routeMap = {
      home: "home",
      chats: "messages",
      friends: "friends",
      calls: "calls",
      settings: "settings",
    };
    navigate(`/chat/${routeMap[panel] || "home"}`);
  };

  return (
    <div className="h-screen w-full bg-[#F2F0E9] flex items-center justify-start p-2 pr-2 font-sans">
      <div className="w-full h-full flex gap-3 overflow-hidden">
        <NavigationSidebar activePanel={activePanel} onPanelChange={handlePanelChange} />
        
        <div className="flex-1 h-full min-w-0 bg-white rounded-3xl shadow-xl overflow-hidden relative">
          {/* Không cần truyền props gì cả, các con tự lấy từ Context */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { authUser, isCheckingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCheckingAuth && !authUser) navigate("/login", { replace: true });
  }, [authUser, isCheckingAuth, navigate]);

  if (isCheckingAuth || !authUser) {
    return <div className="h-screen flex justify-center items-center"><LoaderIcon className="animate-spin" /></div>;
  }

  // Bọc Provider ở ngoài cùng
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}