import { Home, MessageCircle, User, Phone, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

// Component cho 1 icon nav item
const NavItem = ({ icon: Icon, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
      shadow-sm hover:shadow-md hover:-translate-y-1
      ${isActive
        ? "bg-pink-400 text-white shadow-pink-300/30"
        : "bg-white text-black hover:text-pink-400"
      }
    `}
  >
    <Icon size={22} strokeWidth={2} />
  </NavLink>
);

export default function NavigationSidebar({ activePanel, onPanelChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="flex flex-col w-18 h-full py-6 items-center flex-shrink-0 bg-transparent gap-1 overflow-y-auto no-scrollbar">

      {/* Home */}
      <div className="mb-2">
        <NavItem
          icon={Home}
          to="/chat/home"
        />
      </div>

      {/* Chats / Calls / Friends */}
      <div className="flex flex-col gap-4">
        <NavItem
          icon={MessageCircle}
          to="/chat/messages"
        />
        <NavItem
          icon={Phone}
          to="/chat/calls"
        />
        <NavItem
          icon={User}
          to="/chat/friends"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Settings / Logout */}
      <div className="flex flex-col gap-4 mb-4">
        <NavItem
          icon={Settings}
          to="/chat/settings"
        />
        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-black shadow-sm hover:text-pink-400 hover:shadow-md transition-all"
        >
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  );
}
