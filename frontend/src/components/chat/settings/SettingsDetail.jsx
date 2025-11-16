import { useState, useEffect, useRef } from "react"; 
import { useAuth } from "../../../context/AuthContext";
import { LoaderIcon, User, Mail } from "lucide-react"; 

export default function SettingsDetail() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuth(); 
  
  const [formData, setFormData] = useState({ fullName: "" });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
      });
      // Reset preview khi authUser thay đổi
      setPreviewUrl(null); 
      setSelectedFile(null);
    }
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Hàm xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  //Hàm xử lý click nút avatar
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };


  //handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.fullName.trim() === "") {
      toast.error("Họ tên không được để trống"); // Vẫn có thể giữ toast ở đây
      return;
    }

    // Kiểm tra xem có gì thay đổi không
    if (!selectedFile && formData.fullName === authUser.fullName) {
      toast("Không có gì để thay đổi");
      return;
    }
    
    // Tạo FormData
    const uploadData = new FormData();
    uploadData.append('fullName', formData.fullName);
    if (selectedFile) {
      uploadData.append('avatar', selectedFile);
    }

    // Gọi hàm từ Context
    try {
      await updateProfile(uploadData);
    } catch (error) {
      // Context đã ném lỗi (throw error) nên vẫn bắt được
      console.error("Lỗi update (component):", error);
    }
  };

  if (!authUser) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white">
        <LoaderIcon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex items-center p-4 border-b border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Edit Profile
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={
                previewUrl || 
                authUser?.avatar || 
                `https://ui-avatars.com/api/?name=${authUser?.fullName}&background=random`
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full mb-2 object-cover"
            />
            <button
              type="button"
              className="text-sm text-pink-500 hover:underline"
              onClick={handleAvatarClick} 
            >
            Edit avatar
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif image/jpg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={authUser?.email || ""}
                disabled
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="fullName"
              className="block text-gray-700 font-medium mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>
          </div>
          <button
            className="w-full text-white font-semibold py-2 rounded-lg transition-colors bg-pink-400 hover:bg-pink-500 disabled:opacity-50"
            type="submit"
            disabled={isUpdatingProfile} 
          >
            {isUpdatingProfile ? ( 
              <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}