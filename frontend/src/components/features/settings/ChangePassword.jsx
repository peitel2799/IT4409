import { useState } from "react";
import { Loader2, Lock, KeyRound, Eye, EyeOff } from "lucide-react"; 

export default function ChangePassword() {
  // State lưu giá trị các ô input
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false); // State toggle hiện/ẩn mật khẩu
  const [isSubmitting, setIsSubmitting] = useState(false); // State để disable nút khi đang submit

  // Hàm cập nhật state khi input thay đổi
  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Hàm submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // ngăn reload trang
    const { current, new: newPass, confirm } = passwords;

    // Validate dữ liệu
    if (!current || !newPass || !confirm) return toast.error("Please fill in all fields");
    if (newPass.length < 6) return toast.error("New password must be at least 6 characters");
    if (newPass !== confirm) return toast.error("Confirmation password does not match");

    setIsSubmitting(true); // bật loading
    // Giả lập API call
    setTimeout(() => {
      toast.success("Password updated successfully!");
      setIsSubmitting(false); // tắt loading
      setPasswords({ current: "", new: "", confirm: "" }); // reset form
    }, 1500);
  };

  // Component con tái sử dụng cho input password
  const PasswordInput = ({ label, name, value, placeholder, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {/* icon ở bên trái input */}
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"} // toggle hiện/ẩn pass
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition"
        />
        {/* nút hiện/ẩn mật khẩu */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white">
        <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
        <p className="text-sm text-gray-500 mt-1">Update your password to protect your account</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          <PasswordInput
            label="Current Password"
            name="current"
            value={passwords.current}
            placeholder="Enter current password"
            icon={Lock}
          />
          <PasswordInput
            label="New Password"
            name="new"
            value={passwords.new}
            placeholder="Enter new password"
            icon={KeyRound}
          />
          <PasswordInput
            label="Confirm Password"
            name="confirm"
            value={passwords.confirm}
            placeholder="Re-enter new password"
            icon={Lock}
          />

          {/* Nút submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting} // disable khi đang submit
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-pink-500 text-white font-medium rounded-xl hover:bg-pink-600 disabled:opacity-70 transition w-full"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isSubmitting ? "Loading..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
