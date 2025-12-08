import { Home, MessageCircle, User, Phone, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Component cho 1 icon nav item
const NavItem = ({ icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
      shadow-sm hover:shadow-md hover:-translate-y-1
      ${active
        ? "bg-pink-400 text-white shadow-pink-300/30"
        : "bg-white text-black hover:text-pink-400"
      }
    `}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
  </button>
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
          active={activePanel === 'home'} 
          onClick={() => onPanelChange('home')} 
        />
      </div>

      {/* Chats / Calls / Friends */}
      <div className="flex flex-col gap-4">
        <NavItem 
          icon={MessageCircle} 
          active={activePanel === 'chats'} 
          onClick={() => onPanelChange('chats')} 
        />
        <NavItem 
          icon={Phone} 
          active={activePanel === 'calls'} 
          onClick={() => onPanelChange('calls')} 
        />
        <NavItem 
          icon={User} 
          active={activePanel === 'friends'} 
          onClick={() => onPanelChange('friends')} 
        />
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Settings / Logout */}
      <div className="flex flex-col gap-4 mb-4">
        <NavItem 
          icon={Settings} 
          active={activePanel === 'settings'} 
          onClick={() => onPanelChange('settings')} 
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
