import { MessageCircle, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";
const NavIcon = ({
  icon: Icon,
  text,
  active = false,
  badgeCount = 0,
  ...props
}) => (
  <button
    className={`flex flex-col items-center justify-center w-full h-16 
    ${active ? "bg-pink-500 text-white" : "text-white hover:bg-white/30"}`}
    title={text}
    {...props}
  >
    <div className="relative">
      <Icon className="w-6 h-6 mb-1 transition-transform duration-200 group-hover:scale-110" />
      {badgeCount > 0 && (
        <span
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold 
                         w-5 h-5 rounded-full flex items-center justify-center 
                         animate-pulse shadow-lg"
        >
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      )}
    </div>
    <span className="text-xs font-medium">{text}</span>
  </button>
);

// Nhận props 'activePanel' và 'onPanelChange'
export default function NavigationSidebar({ activePanel, onPanelChange }) {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();

  const { friendRequests } = useChat();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-col w-20 bg-pink-400">
        <div className="flex items-center justify-center h-16 mt-2">
          <img
            src={
              authUser?.profilePic ||
              `https://ui-avatars.com/api/?name=${authUser?.fullName}&background=random`
            }
            alt="Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
            title={authUser?.fullName}
          />
        </div>

        <nav className="flex flex-col justify-center">
          <NavIcon
            icon={MessageCircle}
            text="Message"
            active={activePanel === "chats"}
            onClick={() => onPanelChange("chats")}
          />
          <NavIcon
            icon={Users}
            text="Friends"
            active={activePanel === "friends"}
            onClick={() => onPanelChange("friends")}
            badgeCount={friendRequests?.length || 0}
          />
        </nav>
        <div>
          <NavIcon
            icon={Settings}
            text="Settings"
            active={activePanel === "settings"}
            onClick={() => onPanelChange("settings")}
          />
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-16 text-white hover:bg-white/30"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
