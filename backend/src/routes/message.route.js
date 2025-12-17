import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  markAsRead,
  markMessageAsRead,
  sendMessage,
} from "../controllers/message.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", upload.single('image'), sendMessage);

// Mark all messages from a partner as read
router.post("/read/:partnerId", markAsRead);

// Mark individual message as read
router.put("/:messageId/read", markMessageAsRead);

export default router;