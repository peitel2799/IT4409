import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    blockUser,
    unblockUser,
    getBlockedUsers,
} from "../controllers/block.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Block a user
router.post("/block/:userToBlockId", blockUser);

// Unblock a user
router.post("/unblock/:userToUnblockId", unblockUser);

// Get list of blocked users
router.get("/list", getBlockedUsers);

export default router;
