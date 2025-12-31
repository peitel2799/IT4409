import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  getGroupById,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Create a new group
router.post("/", createGroup);

// Get all groups for the authenticated user
router.get("/", getMyGroups);

// Get a specific group by ID
router.get("/:groupId", getGroupById);

// Leave a group
router.post("/:groupId/leave", leaveGroup);

export default router;
