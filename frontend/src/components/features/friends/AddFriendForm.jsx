import { useState, useEffect } from "react";
import { Mail, Send, CheckCircle, UserMinus, Search, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "../../../context/ChatContext";
import FriendsHeader from "./FriendsHeader"; 

export default function AddFriendForm() {
  const { sentRequests, getSentRequests } = useChat();
  
  // --- States ---
  const [localSentList, setLocalSentList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false); // State bật/tắt Modal

  // Form states
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  // --- Effects ---
  useEffect(() => {
    getSentRequests();
  }, [getSentRequests]);

  useEffect(() => {
    if (sentRequests) {
        setLocalSentList(sentRequests);
    }
  }, [sentRequests]);

  // --- Handlers ---
  
  // Xử lý gửi lời mời (trong Modal)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSent(true);
    toast.success(`Friend request sent to ${email}`);
    
    const fakeName = email.split('@')[0];
    const capitalizedName = fakeName.charAt(0).toUpperCase() + fakeName.slice(1);

    const newRequest = {
        _id: Date.now(),
        fullName: capitalizedName, 
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${fakeName}&background=random`
    };
    
    setLocalSentList(prev => [newRequest, ...prev]);
    
    // Reset và đóng modal sau 1 chút
    setTimeout(() => {
        setIsSent(false);
        setEmail("");
        setIsModalOpen(false); // Đóng modal khi xong
    }, 1000);
  };

  const handleCancel = (id) => {
      toast.success("Request cancelled");
      setLocalSentList(prev => prev.filter(req => req._id !== id));
  };

  // Lọc danh sách theo Search Query
  const filteredList = localSentList.filter(req => 
      req.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 relative">
      
      {/* 1. Header: Tìm kiếm & View Mode */}
      <FriendsHeader 
        title="Sent Requests"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 2. Main Content: Danh sách đã gửi */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
        {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search size={48} className="opacity-20 mb-4" />
                <p className="text-sm italic">
                    {searchQuery ? "No requests found matching your search." : "No pending requests sent."}
                </p>
            </div>
        ) : (
            <div className={
                viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
                : "flex flex-col gap-3"
            }>
                {filteredList.map((req) => (
                    <div 
                        key={req._id} 
                        className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md hover:border-pink-200 transition-all ${
                            viewMode === 'grid' ? 'p-4 flex-col text-center sm:flex-row sm:text-left' : 'p-3 px-5'
                        }`}
                    >
                        {/* Avatar */}
                        <img 
                            src={req.avatar} 
                            alt={req.fullName} 
                            className={`${viewMode === 'grid' ? 'w-16 h-16' : 'w-10 h-10'} rounded-full object-cover border border-gray-100`} 
                        />
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate">{req.fullName || "Unknown"}</h4>
                            <p className="text-xs text-gray-400 truncate">{req.email}</p>
                        </div>

                        {/* Status Badge (Optional) */}
                        <span className="hidden sm:inline-block px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full">
                            Pending
                        </span>

                        {/* Cancel Button */}
                        <button 
                            onClick={() => handleCancel(req._id)}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            title="Cancel Request"
                        >
                            <UserMinus size={18} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 3. Floating Action Button (Nút cộng góc màn hình) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-8 right-8 bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-20 group"
        title="Add New Friend"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* 4. MODAL: Add Friend Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                {/* Form Header */}
                <div className="text-center mb-6">
                    <div className="bg-pink-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                        <UserPlusIcon size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Add Friend</h2>
                    <p className="text-sm text-gray-500 mt-1">Enter email address to send request</p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="relative flex items-center group mb-6">
                        <Mail className="absolute left-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all text-sm"
                            required
                            autoFocus
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={!email.trim() || isSent}
                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                            isSent 
                            ? "bg-green-500 text-white" 
                            : "bg-pink-500 hover:bg-pink-600 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        }`}
                    >
                        {isSent ? (
                            <>
                                <CheckCircle size={20} /> Sent Successfully
                            </>
                        ) : (
                            <>
                                <Send size={20} /> Send Request
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// Icon component nhỏ 
const UserPlusIcon = ({ size, className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
);