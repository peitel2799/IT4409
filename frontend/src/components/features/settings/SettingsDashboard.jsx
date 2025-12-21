import { Outlet } from "react-router-dom";
import SettingsSidebar from "./SettingsSidebar";

export default function SettingsDashboard() {
  return (
    <div className="flex h-full w-full bg-[#FAFAFA]">
      
      {/* 1. Sidebar Trái */}
      <div className="w-64 h-full flex-shrink-0 hidden md:block border-r border-gray-100 bg-white">
        <SettingsSidebar />
      </div>

      {/* 2. Nội dung Chính */}
      <div className="flex-1 h-full min-w-0 flex flex-col relative">
              <Outlet />
          
      </div>
    </div>

  );
}