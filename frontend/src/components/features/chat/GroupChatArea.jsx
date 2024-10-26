import { Users } from "lucide-react";
import GroupChatHeader from "./GroupChatHeader";
import GroupMessageList from "./GroupMessageList";
import GroupChatInput from "./GroupChatInput";

export default function GroupChatArea({
  group,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
}) {
  if (!group) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#FAFAFA]">
        <div className="w-40 h-40 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
          <Users size={64} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium text-sm">
          Select a group to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <GroupChatHeader
        group={group}
        onToggleInfoSidebar={onToggleInfoSidebar}
        isInfoSidebarOpen={isInfoSidebarOpen}
      />
      <GroupMessageList group={group} />
      <GroupChatInput group={group} />
    </div>
  );
}

