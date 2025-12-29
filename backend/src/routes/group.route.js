import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { createGroup, getGroups, getGroupById } from "../controllers/group.controller.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

// Create a new group (with optional avatar upload)
router.post("/", upload.single("avatar"), createGroup);

// Get all groups for current user
router.get("/", getGroups);

// Get a specific group by ID
router.get("/:groupId", getGroupById);

export default router;
