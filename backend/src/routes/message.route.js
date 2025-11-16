import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  markAsRead,
  markMessageAsRead,
  reactToMessage,
  searchAllMessages,
  searchMessages,
  sendMessage,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/message.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);

// Search routes (must be before /:id to avoid conflicts)
router.get("/search", searchAllMessages);
router.get("/search/:partnerId", searchMessages);

router.get("/:id", getMessagesByUserId);
router.post("/send/:id", upload.single('image'), sendMessage);

// Mark all messages from a partner as read
router.post("/read/:partnerId", markAsRead);

// Mark individual message as read
router.put("/:messageId/read", markMessageAsRead);

// React to a message
router.put("/:messageId/react", reactToMessage);

// Group message routes
router.get("/group/:groupId", getGroupMessages);
router.post("/group/:groupId/send", upload.single('image'), sendGroupMessage);

export default router;