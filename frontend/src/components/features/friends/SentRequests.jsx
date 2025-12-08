import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { UserMinus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "../../../context/ChatContext";

export default function SentRequests() {
  // Lấy dữ liệu searchQuery, viewMode từ Dashboard thông qua Outlet Context
  const { searchQuery, viewMode } = useOutletContext(); 
  const { sentRequests, getSentRequests } = useChat();
  const [localSentList, setLocalSentList] = useState([]);

  useEffect(() => {
    getSentRequests();
  }, [getSentRequests]);

  useEffect(() => {
    if (sentRequests) setLocalSentList(sentRequests);
  }, [sentRequests]);

  const handleCancel = (id) => {
      toast.success("Request cancelled");
      setLocalSentList(prev => prev.filter(req => req._id !== id));
      // Call API cancel here
  };

  const filteredList = localSentList.filter(req => 
      req.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredList.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Search size={48} className="opacity-20 mb-4" />
            <p className="text-sm italic">
                {searchQuery ? "No requests found matching your search." : "No pending requests sent."}
            </p>
        </div>
    );
  }

  return (
    <div className={
        viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 pr-2 overflow-y-auto custom-scrollbar" 
        : "flex flex-col gap-3 pb-4 pr-2 overflow-y-auto custom-scrollbar"
    }>
        {filteredList.map((req) => (
            <div 
                key={req._id} 
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md hover:border-pink-200 transition-all ${
                    viewMode === 'grid' ? 'p-4 flex-col text-center sm:flex-row sm:text-left' : 'p-3 px-5'
                }`}
            >
                <img 
                    src={req.avatar} 
                    alt={req.fullName} 
                    className={`${viewMode === 'grid' ? 'w-16 h-16' : 'w-10 h-10'} rounded-full object-cover border border-gray-100`} 
                />
                
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{req.fullName || "Unknown"}</h4>
                    <p className="text-xs text-gray-400 truncate">{req.email}</p>
                </div>

                <span className="hidden sm:inline-block px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full">
                    Pending
                </span>

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
  );
}