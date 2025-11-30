import ProfileSettings from "./ProfileSettings"; // Tab chỉnh sửa profile
import ChangePassword from "./ChangePassword";   // Tab đổi mật khẩu

export default function SettingsDetail({ activeTab }) {
  return (
    <>
      {activeTab === "profile" && <ProfileSettings />}
      {activeTab === "password" && <ChangePassword />}
    </>
  );
}
