import { Users, UserCheck, Clock, SendToBack, X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function FriendsSidebar({ onMenuClick }) {
  const menuItems = [
    { path: "all", label: "All Friends", icon: Users },         
    { path: "online", label: "Online", icon: UserCheck },
    { path: "requests", label: "Requests", icon: Clock },
    { path: "sent", label: "Sent Requests", icon: SendToBack },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto relative">
      {/* Nút đóng Sidebar - Chỉ hiện trên Mobile */}
      <button 
        onClick={onMenuClick}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full md:hidden transition-colors"
      >
        <X size={20} />
      </button>

      {/* Header Sidebar */}
      <div className="py-8 px-6 border-b border-gray-50 md:border-none">
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your connections</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2 p-4 md:p-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMenuClick} // Đóng sidebar khi nhấn vào mục trên mobile
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl transition-all font-medium text-sm
              ${isActive 
                ? "bg-pink-50 text-pink-600 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}