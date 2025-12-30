import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import { AppError } from "./AppError.js";

/**
 * Get all contacts (friends) for a user
 */
export const getAllContactsService = async (userId) => {
    const user = await User.findById(userId).populate({
        path: "friends",
        select: "-password",
    });
    return user.friends || [];
};

/**
 * Get messages between two users (private chat only)
 */
export const getMessagesByUserIdService = async (myId, userToChatId) => {
    return await Message.find({
        $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
        ],
        groupId: null, // Only private messages
    })
        .populate("senderId", "fullName profilePic email")
        .populate("receiverId", "fullName profilePic email")
        .sort({ createdAt: 1 }); // Oldest first (for chat display)
};

/**
 * Send a private message (1-1 chat) via REST API (with image upload)
 * Note: Self-messages are allowed for "My Cloud" feature (personal notes/files)
 */
export const sendMessageService = async (senderId, receiverId, text, imageUrl) => {
    if (!text && !imageUrl) {
        throw new AppError("Text or image is required", 400);
    }

    if (!receiverId) {
        throw new AppError("Receiver ID is required for private messages", 400);
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
        throw new AppError("Receiver not found", 404);
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        groupId: null, // Explicitly set to null for private messages
        text,
        image: imageUrl,
    });
    await newMessage.save();
    
    // Populate sender and receiver before returning
    await newMessage.populate("senderId", "fullName profilePic email");
    await newMessage.populate("receiverId", "fullName profilePic email");
    
    return newMessage;
};

/**
 * Send a group message via REST API (with image upload)
 */
export const sendGroupMessageService = async (senderId, groupId, text, imageUrl) => {
    if (!text && !imageUrl) {
        throw new AppError("Text or image is required", 400);
    }

    if (!groupId) {
        throw new AppError("Group ID is required for group messages", 400);
    }

    // Verify group exists and user is a member
    const group = await Group.findOne({
        _id: groupId,
        members: senderId,
    });

    if (!group) {
        throw new AppError("Group not found or you are not a member", 404);
    }

    const newMessage = new Message({
        senderId,
        receiverId: null, // No receiver for group messages
        groupId,
        text,
        image: imageUrl,
    });
    await newMessage.save();
    
    // Populate sender and group before returning
    await newMessage.populate("senderId", "fullName profilePic email");
    await newMessage.populate("groupId", "name avatar members");
    
    return newMessage;
};

/**
 * Get messages by group ID (for group chat)
 */
export const getMessagesByGroupIdService = async (groupId, userId) => {
    // Verify user is a member of the group
    const group = await Group.findOne({
        _id: groupId,
        members: userId,
    });

    if (!group) {
        throw new AppError("Group not found or you are not a member", 404);
    }

    const messages = await Message.find({
        groupId: groupId,
    })
        .populate("senderId", "fullName profilePic email")
        .populate("groupId", "name avatar")
        .sort({ createdAt: 1 }); // Oldest first (for chat display)

    return messages;
};

/**
 * Get all chat partners for a user with last message info and unread count
 * Note: Only includes private messages (excludes group messages)
 */
export const getChatPartnersService = async (userId) => {
    const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        groupId: null, // Only private messages, exclude group messages
    }).sort({ createdAt: -1 });

    // Group messages by chat partner
    const chatPartnerMap = new Map();

    messages.forEach((msg) => {
        const partnerId = msg.senderId.toString() === userId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString();

        if (!chatPartnerMap.has(partnerId)) {
            chatPartnerMap.set(partnerId, {
                partnerId,
                lastMessage: msg,
                unreadCount: 0,
            });
        }

        // Count unread messages (messages sent TO this user that are not read)
        if (msg.receiverId.toString() === userId.toString() && !msg.isRead) {
            const partnerData = chatPartnerMap.get(partnerId);
            partnerData.unreadCount += 1;
        }
    });

    const chatPartnerIds = [...chatPartnerMap.keys()];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select(
        "-password"
    );

    // Combine user data with last message info
    const result = chatPartners.map((partner) => {
        const partnerData = chatPartnerMap.get(partner._id.toString());
        return {
            _id: partner._id,
            fullName: partner.fullName,
            email: partner.email,
            profilePic: partner.profilePic,
            isOnline: partner.isOnline || false,
            lastMessage: partnerData?.lastMessage?.text || "",
            lastMessageTime: partnerData?.lastMessage?.createdAt || "",
            unreadCount: partnerData?.unreadCount || 0,
        };
    });

    // Sort by last message time (most recent first)
    result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return result;
};
//username: partner.username,
//avatar: partner.avatar,
/**
 * Mark all messages from a partner as read (private chat only)
 */
export const markMessagesAsReadService = async (myUserId, partnerId) => {
    if (!partnerId) {
        throw new AppError("Partner ID is required", 400);
    }

    const result = await Message.updateMany(
        {
            senderId: partnerId,
            receiverId: myUserId,
            groupId: null, // Only private messages
            isRead: false,
        },
        { $set: { isRead: true } }
    );

    return {
        partnerId,
        myUserId: myUserId.toString(),
        updatedCount: result.modifiedCount,
    };
};

/**
 * Mark all messages in a group as read for a specific user
 */
export const markGroupMessagesAsReadService = async (userId, groupId) => {
    if (!groupId) {
        throw new AppError("Group ID is required", 400);
    }

    // Verify user is a member of the group
    const group = await Group.findOne({
        _id: groupId,
        members: userId,
    });

    if (!group) {
        throw new AppError("Group not found or you are not a member", 404);
    }

    // Note: For group messages, we might want to track read receipts per user
    // For now, we'll mark all unread messages in the group as read for this user
    // This is a simplified approach - in production, you might want per-user read tracking
    const result = await Message.updateMany(
        {
            groupId: groupId,
            senderId: { $ne: userId }, // Don't mark own messages as read
            isRead: false,
        },
        { $set: { isRead: true } }
    );

    return {
        groupId,
        userId: userId.toString(),
        updatedCount: result.modifiedCount,
    };
};

/**
 * Mark a single message as read by its ID
 */
export const markSingleMessageAsReadService = async (messageId) => {
    const message = await Message.findByIdAndUpdate(
        messageId,
        { isRead: true },
        { new: true }
    );

    if (!message) {
        throw new AppError("Message not found", 404);
    }

    return message;
};

/**
 * Add or remove a reaction to/from a message
 */
export const reactToMessageService = async (messageId, userId, emoji) => {
    const message = await Message.findById(messageId);
    if (!message) {
        throw new AppError("Message not found", 404);
    }

    // Check if user already reacted
    const existingReactionIndex = message.reactions.findIndex(
        (reaction) => reaction.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
        // If same emoji, remove reaction (toggle off)
        if (message.reactions[existingReactionIndex].emoji === emoji) {
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // If different emoji, update it
            message.reactions[existingReactionIndex].emoji = emoji;
        }
    } else {
        // Add new reaction
        message.reactions.push({ emoji, userId });
    }

    await message.save();
    return message;
};
