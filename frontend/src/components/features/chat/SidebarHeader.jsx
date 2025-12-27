import { Search } from "lucide-react";

export default function SidebarHeader({ filter, setFilter, searchQuery, setSearchQuery }) {
  return (
    <div className="flex flex-col gap-3 p-4 pb-2 border-b border-gray-50">
      <div className="flex items-center bg-gray-100 rounded-xl p-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-50 transition-all">
         <Search className="w-5 h-5 text-gray-400" />
         <input
           type="text"
           placeholder="Search..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="flex-1 ml-2 bg-transparent text-sm focus:outline-none text-gray-700"
         />
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl capitalize transition-colors ${
                filter === type
                  ? "bg-pink-100 text-pink-600" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {type === 'all' ? 'All' : 'Unread'}
            </button>
        ))}
      </div>
    </div>
  );
}