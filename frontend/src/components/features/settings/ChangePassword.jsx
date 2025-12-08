import { useState } from "react";
import { Loader2, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../../lib/axios";

// Component for password input - defined OUTSIDE to prevent re-creation on each render
function PasswordInput({ label, name, value, onChange, placeholder, icon: Icon, showPassword, onToggleShow }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { current, new: newPass, confirm } = passwords;

    if (!current || !newPass || !confirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPass.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPass !== confirm) {
      toast.error("Confirmation password does not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword: current,
        newPassword: newPass,
      });
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

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
            onChange={handleChange}
            placeholder="Enter current password"
            icon={Lock}
            showPassword={showPassword}
            onToggleShow={toggleShowPassword}
          />
          <PasswordInput
            label="New Password"
            name="new"
            value={passwords.new}
            onChange={handleChange}
            placeholder="Enter new password"
            icon={KeyRound}
            showPassword={showPassword}
            onToggleShow={toggleShowPassword}
          />
          <PasswordInput
            label="Confirm Password"
            name="confirm"
            value={passwords.confirm}
            onChange={handleChange}
            placeholder="Re-enter new password"
            icon={Lock}
            showPassword={showPassword}
            onToggleShow={toggleShowPassword}
          />

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-pink-500 text-white font-medium rounded-xl hover:bg-pink-600 disabled:opacity-70 transition w-full"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
