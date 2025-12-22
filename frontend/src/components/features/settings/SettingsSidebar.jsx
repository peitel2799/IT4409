import { User, Lock } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SettingsSidebar() {
  const menuItems = [
    { path: "profile", label: "Profile", icon: User },
    { path: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="flex flex-col h-full py-6 px-6 bg-white overflow-y-auto border-r border-gray-100">
      {/* Header Sidebar */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
              ${isActive 
                ? "bg-pink-50 text-pink-600 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <item.icon size={20} strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}