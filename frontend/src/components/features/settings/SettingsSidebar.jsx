import { User, Lock } from "lucide-react";
import SidebarMenu from "../SidebarMenu";

export default function SettingsSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="flex flex-col h-full py-6 px-6 bg-white overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account</p>
      </div>

      <SidebarMenu
        items={menuItems}
        activeId={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}
