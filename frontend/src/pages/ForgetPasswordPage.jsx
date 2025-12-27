import { useState, useEffect } from "react";
import { MessageCircleIcon, MailIcon, LockIcon, KeyRound, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  // 1: Nhập email, 2: Nhập OTP & Password mới
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(0);

  // Logic đếm ngược cho tính năng gửi lại mã (Resend OTP)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      // Chuyển sang step OTP và kích hoạt countdown
      setStep(2);
      setCountdown(60);
      return;
    }

    // Logic hoàn tất reset mật khẩu
    alert("Demo: Password reset success!");
  };

  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(60);
      // TODO: Call API gửi lại OTP ở đây
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden min-h-screen md:min-h-0 md:h-[600px]">
      
      {/* Left Column: Form xử lý chính */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center border-r border-gray-200">
        <div className="w-full max-w-md">

          {/* Header Section */}
          <div className="text-center mb-6 md:mb-8">
            <MessageCircleIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto text-pink-400 mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              {step === 1 
                ? "Enter your email to receive an OTP code."
                : "Enter the OTP code and your new password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">

            {/* Step 1: Nhập Email xác thực */}
            {step === 1 && (
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">Email</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size={18}" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-3 py-2.5 md:py-2 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-[#D3D0FB] text-sm md:text-base"
                    placeholder="yourname@example.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Nhập OTP & Pass mới */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size={18}" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2.5 md:py-2 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[#D3D0FB] tracking-widest font-bold text-center text-sm md:text-base"
                      placeholder="• • • • • •"
                    />
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0}
                      className={`text-xs md:text-sm font-medium hover:underline transition-colors ${
                        countdown > 0 ? "text-gray-400 cursor-not-allowed no-underline" : "text-[#847ef2]"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">New Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size={18}" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-3 py-2.5 md:py-2 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[#D3D0FB] text-sm md:text-base"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full text-white font-semibold py-3 md:py-2 rounded-lg transition-all 
                bg-[#D3D0FB] hover:bg-[#847ef2] active:scale-95 shadow-md"
            >
              {step === 1 ? "Send OTP" : "Reset Password"}
            </button>
          </form>

          {/* Bottom Actions */}
          <div className="mt-6 text-center">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setCountdown(0); }}
                className="text-gray-500 hover:text-gray-800 text-xs md:text-sm mb-4 block w-full"
              >
                Change Email?
              </button>
            )}

            <Link
              to="/login"
              className="text-pink-400 hover:underline font-medium flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Image (Hidden on mobile) */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/sample.png')" }}
      ></div>
    </div>
  );
}

export default ForgotPasswordPage;