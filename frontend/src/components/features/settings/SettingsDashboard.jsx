import { Outlet } from "react-router-dom";
import SettingsSidebar from "./SettingsSidebar";

export default function SettingsDashboard() {
  return (

    <div className="flex flex-col md:flex-row h-full w-full bg-[#FAFAFA]">
      
      {/* Sidebar: Trên mobile là thanh điều hướng ngang, trên desktop là cột dọc */}
      <div className="bg-white border-b border-gray-100 p-5 shadow-sm">
        <div className="md:hidden flex flex-col gap-2">
          <h1 className="text-xl font-bold text-gray-800 truncate">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account</p>
        </div>
        <SettingsSidebar />
      </div>

      {/* Nội dung Chính */}
      <div className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}