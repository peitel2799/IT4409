import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { FriendProvider } from "../context/FriendContext";
import { ChatProvider } from "../context/ChatContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import NavigationSidebar from "../components/features/NavigationSidebar";

// Content component separated from Providers
const ChatPageContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Highlight Sidebar based on URL
  const currentPath = location.pathname.split("/").pop();
  const activePanel = currentPath === "messages" ? "chats" : currentPath;

  // 2. Navigate to URL when clicking Sidebar
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
          {/* Child routes will render here via Outlet */}
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

  // Wrap with all providers in proper order:
  // SocketProvider -> FriendProvider -> ChatProvider
  return (
    <SocketProvider>
      <FriendProvider>
        <ChatProvider>
          <ChatPageContent />
        </ChatProvider>
      </FriendProvider>
    </SocketProvider>
  );
}