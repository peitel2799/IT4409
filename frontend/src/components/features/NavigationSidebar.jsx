import { Home, MessageCircle, User, Phone, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

const NavItem = ({ icon: Icon, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
      shadow-sm hover:shadow-md md:hover:-translate-y-1
      ${isActive
        ? "bg-pink-400 text-white shadow-pink-300/30 scale-110 md:scale-100"
        : "bg-white text-black hover:text-pink-400"
      }
    `}
  >
    <Icon size={22} strokeWidth={2} />
  </NavLink>
);

export default function NavigationSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className={`
        flex md:flex-col
        w-full md:w-16
        h-auto md:h-full
        px-4 py-3 md:px-0 md:py-4
        items-center
        justify-between md:justify-start
        gap-2 md:gap-4
        z-50

        bg-white/80 md:bg-transparent
        backdrop-blur-md md:backdrop-blur-0

        border-t border-gray-100 md:border-none
      `}
    >

      {/* Home */}
      <div className="md:mb-2 flex-shrink-0">
        <NavItem icon={Home} to="/chat/home" />
      </div>

      {/* Main Nav Items */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-4 items-center">
        <NavItem icon={MessageCircle} to="/chat/messages" />
        <NavItem icon={Phone} to="/chat/calls" />
        <NavItem icon={User} to="/chat/friends" />
        {/* Settings: Chỉ hiện trong cụm này khi ở Mobile */}
        <div className="md:hidden">
          <NavItem icon={Settings} to="/chat/settings" />
        </div>
      </div>

      {/* Khoảng trống đẩy các nút còn lại xuống dưới (chỉ có tác dụng trên desktop) */}
      <div className="hidden md:flex flex-1"></div>

      {/* Bottom Actions: Settings (Desktop) & Logout (Cả hai) */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-4 mb-0 md:mb-4 items-center flex-shrink-0">
        {/* Settings: Chỉ hiện ở đây khi ở Desktop */}
        <div className="hidden md:block">
          <NavItem icon={Settings} to="/chat/settings" />
        </div>

        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-black shadow-sm hover:text-pink-400 hover:shadow-md transition-all active:scale-95 shrink-0"
        >
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  );
}