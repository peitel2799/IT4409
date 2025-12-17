import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getCallHistory,
  getCallStats,
  deleteCallRecord,
} from "../controllers/call.controller.js";

const router = express.Router();

// Get call history
router.get("/history", protectRoute, getCallHistory);

// Get call statistics
router.get("/stats", protectRoute, getCallStats);

// Delete a call record
router.delete("/:callId", protectRoute, deleteCallRecord);

export default router;
