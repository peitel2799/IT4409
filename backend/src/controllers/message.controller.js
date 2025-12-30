import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { getReceiverSocketIds, io } from "../lib/socket.js";
import {
  getAllContactsService,
  getChatPartnersService,
  getMessagesByUserIdService,
  getMessagesByGroupIdService,
  markMessagesAsReadService,
  markGroupMessagesAsReadService,
  markSingleMessageAsReadService,
  reactToMessageService,
  sendMessageService,
  sendGroupMessageService,
} from "../services/message.service.js";

// Helper to emit to all sockets of a user
function emitToUser(userId, event, data) {
  const socketIds = getReceiverSocketIds(userId);
  socketIds.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
}

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await getAllContactsService(req.user._id);
    res.status(200).json(contacts);
  } catch (error) {
    console.error("getAllContacts:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await getMessagesByUserIdService(myId, userToChatId);
    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessagesByUserId:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    const newMessage = await sendMessageService(senderId, receiverId, text, imageUrl);

    // Emit socket event to all receiver sockets
    emitToUser(receiverId, "newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const chatPartners = await getChatPartnersService(req.user._id);
    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("getChatPartners:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const myUserId = req.user._id;
    const { partnerId } = req.params;

    const result = await markMessagesAsReadService(myUserId, partnerId);

    // Emit socket event to all partner sockets
    emitToUser(partnerId, "messagesRead", {
      partnerId: result.myUserId,
    });

    res.status(200).json({
      message: "Messages marked as read",
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("markAsRead:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await markSingleMessageAsReadService(messageId);

    // Emit socket event to all sender sockets
    emitToUser(message.senderId, "messageRead", {
      messageId: messageId,
      readBy: req.user._id,
    });

    res.status(200).json(message);
  } catch (error) {
    console.error("markMessageAsRead:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const updatedMessage = await reactToMessageService(messageId, userId, emoji);

    // Emit socket event to sender and receiver (or group members if group message)
    if (updatedMessage.groupId) {
      // Group message: emit to all group members
      // Note: This will be handled better in socket.js with group rooms (future step)
      const groupId = updatedMessage.groupId.toString();
      io.emit(`group:${groupId}:messageReaction`, updatedMessage);
    } else {
      // Private message: emit to sender and receiver
      const receiverId = updatedMessage.senderId.toString() === userId.toString()
        ? updatedMessage.receiverId
        : updatedMessage.senderId;

      emitToUser(receiverId, "messageReaction", updatedMessage);
      emitToUser(userId, "messageReaction", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("reactToMessage:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

/**
 * Send a group message
 */
export const sendGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    const newMessage = await sendGroupMessageService(senderId, groupId, text, imageUrl);

    // Emit socket event to all group members
    // Note: This will be improved in socket.js with group rooms (future step)
    const groupIdStr = groupId.toString();
    io.emit(`group:${groupIdStr}:newMessage`, newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendGroupMessage:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

/**
 * Get messages by group ID
 */
export const getMessagesByGroupId = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const messages = await getMessagesByGroupIdService(groupId, userId);
    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessagesByGroupId:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

/**
 * Mark all messages in a group as read
 */
export const markGroupAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const result = await markGroupMessagesAsReadService(userId, groupId);

    // Emit socket event to group members (simplified for now)
    const groupIdStr = groupId.toString();
    io.emit(`group:${groupIdStr}:messagesRead`, {
      groupId,
      readBy: userId,
    });

    res.status(200).json({
      message: "Group messages marked as read",
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("markGroupAsRead:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};
