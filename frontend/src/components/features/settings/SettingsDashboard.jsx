import { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";
import SettingsDetail from "./SettingsDetail";

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="layout-container">
      
      {/* 1. Sidebar Trái */}
      <div className="sidebar-panel">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 2. Nội dung Chính */}
      <div className="main-content">
        <div className="scroll-area">
           <div className="max-w-2xl mx-auto pt-4">
              <SettingsDetail activeTab={activeTab} />
           </div>
        </div>
      </div>

    </div>
  );
}