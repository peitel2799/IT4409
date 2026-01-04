import { useState, useCallback, useEffect, useRef, forwardRef } from "react";
import toast from "react-hot-toast";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import MessageSearch from "./MessageSearch";
import { MessageCircleMore, ShieldAlert, ShieldCheck } from "lucide-react";
import { useFriend } from "../../../context/FriendContext";
import { useBlock } from "../../../context/BlockContext";

const ChatArea = forwardRef(function ChatArea({
  chat,
  onToggleInfoSidebar,
  isInfoSidebarOpen,
  externalHighlightMessageId,
  onHighlightProcessed,
}, ref) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState(null);
  const messageListRef = useRef(null);
  const { friends, sendFriendRequest, sentRequests } = useFriend();
  const { isUserBlocked, blockUser, unblockUser } = useBlock();

  // Check friend status
  const isFriend = friends.some(f => f._id === chat?._id) || chat?.isSelfChat;
  const hasSentRequest = sentRequests && sentRequests.some(req => req._id === chat?._id);
  const isBlocked = isUserBlocked(chat?._id);

  // Toggle search panel
  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setHighlightMessageId(null);
    }
  }, [isSearchOpen]);

  // Close search when chat changes
  useEffect(() => {
    setIsSearchOpen(false);
    setHighlightMessageId(null);
  }, [chat?._id, chat?.id]);

  // Handle external highlight (from sidebar search)
  useEffect(() => {
    if (externalHighlightMessageId) {
      setHighlightMessageId(externalHighlightMessageId);

      // Scroll to message with a delay to ensure messages are loaded
      setTimeout(() => {
        const messageElement = document.getElementById(`message-${externalHighlightMessageId}`);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
          messageElement.classList.add("highlight-message");
          setTimeout(() => {
            messageElement.classList.remove("highlight-message");
          }, 2000);
        }
      }, 500);

      // Notify parent that highlight was processed
      if (onHighlightProcessed) {
        onHighlightProcessed();
      }
    }
  }, [externalHighlightMessageId, onHighlightProcessed]);

  // Keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && chat) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chat]);

  // Navigate to a specific message (from ChatHeader search)
  const handleNavigateToMessage = useCallback((messageId) => {
    setHighlightMessageId(messageId);

    // Scroll to message with a slight delay to ensure render
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Add highlight effect
        messageElement.classList.add("highlight-message");
        setTimeout(() => {
          messageElement.classList.remove("highlight-message");
        }, 2000);
      }
    }, 100);
  }, []);

  // Close search
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setHighlightMessageId(null);
  }, []);

  // Handle add friend button click
  const handleAddFriend = async () => {
    if (!chat?._id) return;
    try {
      await sendFriendRequest(chat._id);
      toast.success('Friend request sent!');
    } catch (error) {
      // Error is already handled in the context
    }
  };

  // Handle block/unblock user
  const handleBlockToggle = async () => {
    if (!chat?._id || chat?.isSelfChat) return;
    try {
      if (isBlocked) {
        await unblockUser(chat._id);
        toast.success('User unblocked');
      } else {
        await blockUser(chat._id);
        toast.success('User blocked as spam');
      }
    } catch (error) {
      // Error is already handled in the context
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#FAFAFA]">
        <div className="w-40 h-40 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
          <MessageCircleMore size={64} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex-1 flex flex-col h-full bg-white relative">
      <ChatHeader
        chat={chat}
        onToggleInfoSidebar={onToggleInfoSidebar}
        isInfoSidebarOpen={isInfoSidebarOpen}
        onToggleSearch={handleToggleSearch}
        isSearchOpen={isSearchOpen}
      />

      {/* Search Panel */}
      {isSearchOpen && (
        <MessageSearch
          chat={chat}
          onClose={handleCloseSearch}
          onNavigateToMessage={handleNavigateToMessage}
        />
      )}

      {/* Blocked user warning */}
      {isBlocked && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 border-y border-red-200">
          <div className="flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">
              <span className="font-semibold">This user is blocked.</span> They are marked as spam.
            </p>
            <button
              onClick={handleBlockToggle}
              className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Unblock
            </button>
          </div>
        </div>
      )}

      {/* Non-friend notification banner */}
      {!isFriend && !isBlocked && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Not friends yet.</span> Add {chat.fullName} as a friend to stay connected!
            </p>
            <div className="flex items-center gap-2">
              {!hasSentRequest ? (
                <button
                  onClick={handleAddFriend}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Add Friend
                </button>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                  Request Sent
                </span>
              )}
              <button
                onClick={handleBlockToggle}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1"
                title="Mark as spam"
              >
                <ShieldAlert className="w-4 h-4" />
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageList
        ref={messageListRef}
        chat={chat}
        highlightMessageId={highlightMessageId}
      />

      <ChatInput chat={chat} />

      {/* CSS for message highlighting */}
      <style jsx>{`
        :global(.highlight-message) {
          animation: highlightPulse 2s ease-out;
        }
        
        @keyframes highlightPulse {
          0%, 100% {
            background-color: transparent;
          }
          25%, 75% {
            background-color: rgba(251, 191, 36, 0.3);
          }
        }
      `}</style>
    </div>
  );
});

export default ChatArea;