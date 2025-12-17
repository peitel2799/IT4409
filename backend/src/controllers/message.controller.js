import { getReceiverSocketIds, io } from "../lib/socket.js";
import {
  getAllContactsService,
  getMessagesByUserIdService,
  sendMessageService,
  getChatPartnersService,
  markMessagesAsReadService,
  markSingleMessageAsReadService,
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
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const newMessage = await sendMessageService(senderId, receiverId, text, image);

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