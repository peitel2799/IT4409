import { Search } from "lucide-react";
import CallHistoryItem from "./CallHistoryItem";

export default function CallsList({ calls, onCall, onVideo, onMessage }) {
  // Trạng thái trống
  if (calls.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-gray-400 h-full min-h-[300px]">
            <Search size={40} className="opacity-20 mb-2"/>
            <p>No calls found.</p>
        </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
        {calls.map((call) => (
            <CallHistoryItem 
                key={call.id} call={call} 
                onCall={onCall} onVideo={onVideo} onMessage={onMessage}
            />
        ))}
    </div>
  );
}