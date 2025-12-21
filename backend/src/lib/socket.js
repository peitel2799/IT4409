import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Call from "../models/Call.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// Store multiple sockets per user: {userId: Set<socketId>}
const userSocketsMap = {};

// Helper function to get all socket IDs for a user
export function getReceiverSocketIds(userId) {
  return userSocketsMap[userId] ? Array.from(userSocketsMap[userId]) : [];
}

// Helper function to emit to all sockets of a user
function emitToUser(userId, event, data) {
  const socketIds = getReceiverSocketIds(userId);
  socketIds.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
}

// Helper function to emit to only ONE socket of a user (the most recent one)
// Used for WebRTC events to prevent duplicate processing
function emitToOneSocket(userId, event, data) {
  const socketIds = getReceiverSocketIds(userId);
  if (socketIds.length > 0) {
    // Emit to the last (most recent) socket only
    const targetSocketId = socketIds[socketIds.length - 1];
    io.to(targetSocketId).emit(event, data);
    console.log(`Emitted ${event} to single socket ${targetSocketId} for user ${userId}`);
  }
}

// Check if user is online (has at least one socket)
export function isUserOnline(userId) {
  return userSocketsMap[userId] && userSocketsMap[userId].size > 0;
}

// Get online user IDs
function getOnlineUserIds() {
  return Object.keys(userSocketsMap).filter(userId => userSocketsMap[userId].size > 0);
}

// Store active calls {callId: {callerId, receiverId, status, isVideo, startTime, answeredAt}}
const activeCalls = {};

// Helper function to save call record to database
async function saveCallRecord(callId, status) {
  const call = activeCalls[callId];
  if (!call) {
    console.log("No active call found for callId:", callId);
    return;
  }

  try {
    const endTime = Date.now();
    const duration = call.answeredAt 
      ? Math.round((endTime - call.answeredAt) / 1000) 
      : 0;

    const callRecord = new Call({
      callId,
      caller: call.callerId,
      receiver: call.receiverId,
      callType: call.isVideo ? "video" : "audio",
      status,
      duration,
      startedAt: call.answeredAt ? new Date(call.answeredAt) : null,
      endedAt: status === "answered" ? new Date(endTime) : null,
    });

    await callRecord.save();
    console.log("Call record saved:", callId, "status:", status, "duration:", duration);
  } catch (error) {
    console.error("Error saving call record:", error);
  }
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  
  // Add socket to user's socket set
  if (!userSocketsMap[userId]) {
    userSocketsMap[userId] = new Set();
  }
  userSocketsMap[userId].add(socket.id);
  
  console.log(`User ${socket.user.fullName} now has ${userSocketsMap[userId].size} socket(s)`);

  // Broadcast online users to all clients
  io.emit("getOnlineUsers", getOnlineUserIds());

  // ==================== WebRTC Signaling Events ====================

  // Handle call initiation
  socket.on("call:initiate", ({ receiverId, callerInfo, isVideo }) => {
    console.log("=== CALL INITIATE ===");
    console.log("From:", userId, "To:", receiverId);
    console.log("CallerInfo:", callerInfo);
    console.log("Online users:", getOnlineUserIds());
    
    const callId = `${userId}-${receiverId}-${Date.now()}`;
    
    const isReceiverOnline = isUserOnline(receiverId);
    console.log("Receiver online:", isReceiverOnline);
    
    // Store call info
    activeCalls[callId] = {
      callerId: userId,
      receiverId,
      status: "ringing",
      isVideo,
      startTime: Date.now()
    };

    if (isReceiverOnline) {
      console.log("Emitting call:incoming to receiver (all sockets)");
      emitToUser(receiverId, "call:incoming", {
        callId,
        callerId: userId,
        callerInfo,
        isVideo
      });
      // Emit ringing to all caller sockets
      emitToUser(userId, "call:ringing", { callId, receiverId });
      console.log("call:ringing emitted to caller");
    } else {
      // Receiver is offline - save call record as unavailable
      console.log("Receiver is offline");
      saveCallRecord(callId, "unavailable");
      socket.emit("call:unavailable", { 
        receiverId, 
        reason: "User is offline" 
      });
      delete activeCalls[callId];
    }
  });

  // Handle call acceptance
  socket.on("call:accept", ({ callId, callerId, receiverInfo }) => {
    console.log("=== CALL ACCEPT ===");
    console.log("CallId:", callId);
    console.log("CallerId:", callerId);
    console.log("ReceiverInfo:", receiverInfo);
    console.log("From user:", userId);
    
    if (activeCalls[callId]) {
      activeCalls[callId].status = "connected";
      activeCalls[callId].answeredAt = Date.now(); // Track when call was answered
    }

    // Emit to ONE caller socket only (the call window) to prevent duplicate handling
    emitToOneSocket(callerId, "call:accepted", {
      callId,
      receiverId: userId,
      receiverInfo
    });
  });

  // Handle call rejection
  socket.on("call:reject", async ({ callId, callerId, reason }) => {
    // Save call record as rejected
    await saveCallRecord(callId, "rejected");
    
    if (activeCalls[callId]) {
      delete activeCalls[callId];
    }

    // Emit to all caller sockets
    emitToUser(callerId, "call:rejected", {
      callId,
      receiverId: userId,
      reason: reason || "Call declined"
    });
  });

  // Handle call end
  socket.on("call:end", async ({ callId, recipientId }) => {
    // Save call record - if it was answered (has answeredAt), save as answered, else as missed
    const call = activeCalls[callId];
    if (call) {
      const status = call.answeredAt ? "answered" : "missed";
      await saveCallRecord(callId, status);
      delete activeCalls[callId];
    }

    // Emit to all recipient sockets
    emitToUser(recipientId, "call:ended", {
      callId,
      endedBy: userId
    });
  });

  // Handle WebRTC offer - send to ONE socket only (call window)
  socket.on("webrtc:offer", ({ recipientId, offer, callId }) => {
    console.log("WebRTC offer from", userId, "to", recipientId);
    emitToOneSocket(recipientId, "webrtc:offer", {
      callId,
      senderId: userId,
      offer
    });
  });

  // Handle WebRTC answer - send to ONE socket only (call window)
  socket.on("webrtc:answer", ({ recipientId, answer, callId }) => {
    console.log("WebRTC answer from", userId, "to", recipientId);
    emitToOneSocket(recipientId, "webrtc:answer", {
      callId,
      senderId: userId,
      answer
    });
  });

  // Handle ICE candidate exchange - send to ONE socket only
  socket.on("webrtc:ice-candidate", ({ recipientId, candidate, callId }) => {
    emitToOneSocket(recipientId, "webrtc:ice-candidate", {
      callId,
      senderId: userId,
      candidate
    });
  });

  // Handle call busy (user already in a call)
  socket.on("call:busy", async ({ callId, callerId }) => {
    // Save call record as busy
    await saveCallRecord(callId, "busy");
    
    if (activeCalls[callId]) {
      delete activeCalls[callId];
    }

    emitToUser(callerId, "call:busy", {
      callId,
      receiverId: userId
    });
  });

  // ==================== End WebRTC Signaling Events ====================

  // with socket.on we listen for events from clients
  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.user.fullName);
    
    // Remove this socket from user's socket set
    if (userSocketsMap[userId]) {
      userSocketsMap[userId].delete(socket.id);
      console.log(`User ${socket.user.fullName} now has ${userSocketsMap[userId].size} socket(s)`);
      
      // Only clean up if user has no more sockets (completely offline)
      if (userSocketsMap[userId].size === 0) {
        // End any active calls involving this user
        for (const callId of Object.keys(activeCalls)) {
          const call = activeCalls[callId];
          if (call.callerId === userId || call.receiverId === userId) {
            const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;
            
            // Save call record
            const status = call.answeredAt ? "answered" : "missed";
            await saveCallRecord(callId, status);
            
            emitToUser(otherUserId, "call:ended", {
              callId,
              endedBy: userId,
              reason: "User disconnected"
            });
            delete activeCalls[callId];
          }
        }
        
        delete userSocketsMap[userId];
      }
    }
    
    io.emit("getOnlineUsers", getOnlineUserIds());
  });
});

export { io, app, server };