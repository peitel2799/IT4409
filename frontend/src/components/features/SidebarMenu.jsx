import { ChevronRight } from "lucide-react";

export default function SidebarMenu({ items, activeId, onChange }) {
  return (
    <nav className="flex flex-col gap-3">
      {items.map(item => {
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              group flex items-center justify-between w-full p-4 rounded-xl transition-all duration-200
              ${isActive
                ? "bg-pink-50 text-pink-700 shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }
            `}
          >
            {/* Icon + Label */}
            <div className="flex items-center gap-3">
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-pink-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
                strokeWidth={2}  
              />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                {item.label}
              </span>
            </div>

            {/* Mũi tên active */}
            {isActive && <ChevronRight className="w-4 h-4 text-pink-400" />}
          </button>
        );
      })}
    </nav>
  );
}
