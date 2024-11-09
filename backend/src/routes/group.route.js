import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { createGroup, getGroups, getGroupById, leaveGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

// Create a new group (with optional avatar upload)
router.post("/", upload.single("avatar"), createGroup);

// Get all groups for current user
router.get("/", getGroups);

// Get a specific group by ID
router.get("/:groupId", getGroupById);

// Leave a group
router.post("/:groupId/leave", leaveGroup);

export default router;
