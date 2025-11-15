import { useAuth } from "../../../context/AuthContext"; 
import { ArrowLeft } from "lucide-react";


export default function SettingsSidebar() {
  const { authUser } = useAuth();

  if (!authUser) return null;

  return (
    <div className="relative flex flex-col w-80 h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      {/*Thông tin cơ bản */}
      <div className="flex flex-col items-center p-6 border-b">
        <img
          src={
            authUser.avatar ||
            `https://ui-avatars.com/api/?name=${authUser.fullName}&background=random`
          }
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
        <h3 className="text-xl font-semibold text-gray-900">
          {authUser.fullName}
        </h3>
        <p className="text-sm text-gray-500">{authUser.email}</p>
      </div>
    </div>
  );
}