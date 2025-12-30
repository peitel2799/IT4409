import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Call from "../models/Call.js";
import Group from "../models/Group.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userSocketsMap = {};

export function getReceiverSocketIds(userId) {
  return userSocketsMap[userId] ? Array.from(userSocketsMap[userId]) : [];
}

function emitToUser(userId, event, data) {
  const socketIds = getReceiverSocketIds(userId);
  socketIds.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
}

function emitToOneSocket(userId, event, data) {
  const socketIds = getReceiverSocketIds(userId);
  if (socketIds.length > 0) {
    const targetSocketId = socketIds[socketIds.length - 1];
    io.to(targetSocketId).emit(event, data);
    console.log(`Emitted ${event} to single socket ${targetSocketId} for user ${userId}`);
  }
}

export function isUserOnline(userId) {
  return userSocketsMap[userId] && userSocketsMap[userId].size > 0;
}

function getOnlineUserIds() {
  return Object.keys(userSocketsMap).filter(userId => userSocketsMap[userId].size > 0);
}

// Helper to emit to all members of a group
async function emitToGroupMembers(groupId, event, data, excludeUserId = null) {
  try {
    const group = await Group.findById(groupId).select("members");
    if (!group) return;

    group.members.forEach(memberId => {
      const memberIdStr = memberId.toString();
      if (excludeUserId && memberIdStr === excludeUserId.toString()) return;
      emitToUser(memberIdStr, event, data);
    });
  } catch (error) {
    console.error("Error emitting to group members:", error);
  }
}

// Helper to join user to all their group rooms
async function joinUserGroups(socket, userId) {
  try {
    const groups = await Group.find({ members: userId }).select("_id");
    groups.forEach(group => {
      const roomName = `group:${group._id}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    });
  } catch (error) {
    console.error("Error joining user to group rooms:", error);
  }
}

const activeCalls = {};

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

  if (!userSocketsMap[userId]) {
    userSocketsMap[userId] = new Set();
  }
  userSocketsMap[userId].add(socket.id);

  console.log(`User ${socket.user.fullName} now has ${userSocketsMap[userId].size} socket(s)`);

  // Join user to all their group rooms
  joinUserGroups(socket, userId);

  io.emit("getOnlineUsers", getOnlineUserIds());

  // Handle call initiation
  socket.on("call:initiate", ({ receiverId, callerInfo, isVideo }) => {
    console.log("=== CALL INITIATE ===");
    console.log("From:", userId, "To:", receiverId);
    console.log("CallerInfo:", callerInfo);
    console.log("Online users:", getOnlineUserIds());

    const callId = `${userId}-${receiverId}-${Date.now()}`;

    const isReceiverOnline = isUserOnline(receiverId);
    console.log("Receiver online:", isReceiverOnline);

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
      emitToUser(userId, "call:ringing", { callId, receiverId });
      console.log("call:ringing emitted to caller");
    } else {
      console.log("Receiver is offline");
      saveCallRecord(callId, "unavailable");
      socket.emit("call:unavailable", {
        receiverId,
        reason: "User is offline"
      });
      delete activeCalls[callId];
    }
  });

  socket.on("call:accept", ({ callId, callerId, receiverInfo }) => {
    console.log("=== CALL ACCEPT ===");
    console.log("CallId:", callId);
    console.log("CallerId:", callerId);
    console.log("ReceiverInfo:", receiverInfo);
    console.log("From user:", userId);

    if (activeCalls[callId]) {
      activeCalls[callId].status = "connected";
      activeCalls[callId].answeredAt = Date.now();
    }

    emitToOneSocket(callerId, "call:accepted", {
      callId,
      receiverId: userId,
      receiverInfo
    });
  });

  socket.on("call:reject", async ({ callId, callerId, reason }) => {
    await saveCallRecord(callId, "rejected");

    if (activeCalls[callId]) {
      delete activeCalls[callId];
    }

    emitToUser(callerId, "call:rejected", {
      callId,
      receiverId: userId,
      reason: reason || "Call declined"
    });
  });

  socket.on("call:end", async ({ callId, recipientId }) => {
    const call = activeCalls[callId];
    if (call) {
      const status = call.answeredAt ? "answered" : "missed";
      await saveCallRecord(callId, status);
      delete activeCalls[callId];
    }

    emitToUser(recipientId, "call:ended", {
      callId,
      endedBy: userId
    });
  });

  socket.on("webrtc:offer", ({ recipientId, offer, callId }) => {
    console.log("WebRTC offer from", userId, "to", recipientId);
    emitToOneSocket(recipientId, "webrtc:offer", {
      callId,
      senderId: userId,
      offer
    });
  });

  socket.on("webrtc:answer", ({ recipientId, answer, callId }) => {
    console.log("WebRTC answer from", userId, "to", recipientId);
    emitToOneSocket(recipientId, "webrtc:answer", {
      callId,
      senderId: userId,
      answer
    });
  });

  socket.on("webrtc:ice-candidate", ({ recipientId, candidate, callId }) => {
    emitToOneSocket(recipientId, "webrtc:ice-candidate", {
      callId,
      senderId: userId,
      candidate
    });
  });

  socket.on("call:busy", async ({ callId, callerId }) => {
    await saveCallRecord(callId, "busy");

    if (activeCalls[callId]) {
      delete activeCalls[callId];
    }

    emitToUser(callerId, "call:busy", {
      callId,
      receiverId: userId
    });
  });

  // Typing indicator events (private chat)
  socket.on("user:typing", ({ receiverId }) => {
    emitToUser(receiverId, "user:typing", { senderId: userId });
  });

  socket.on("user:stop-typing", ({ receiverId }) => {
    emitToUser(receiverId, "user:stop-typing", { senderId: userId });
  });

  // ========== GROUP CHAT EVENTS ==========

  // Join a specific group room (used when creating/joining a new group)
  socket.on("group:join", async ({ groupId }) => {
    try {
      const group = await Group.findOne({ _id: groupId, members: userId });
      if (group) {
        const roomName = `group:${groupId}`;
        socket.join(roomName);
        console.log(`User ${socket.user.fullName} joined group room ${roomName}`);
        socket.emit("group:joined", { groupId });
      } else {
        socket.emit("group:error", { message: "You are not a member of this group" });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      socket.emit("group:error", { message: "Failed to join group" });
    }
  });

  // Leave a specific group room
  socket.on("group:leave", ({ groupId }) => {
    const roomName = `group:${groupId}`;
    socket.leave(roomName);
    console.log(`User ${socket.user.fullName} left group room ${roomName}`);
  });

  // Send a message to a group (real-time via socket)
  socket.on("group:sendMessage", async ({ groupId, message }) => {
    try {
      // Verify user is a member
      const group = await Group.findOne({ _id: groupId, members: userId });
      if (!group) {
        socket.emit("group:error", { message: "You are not a member of this group" });
        return;
      }

      // Broadcast to all group members (including sender for confirmation)
      const roomName = `group:${groupId}`;
      io.to(roomName).emit("group:newMessage", {
        groupId,
        message: {
          ...message,
          senderId: userId,
          senderInfo: {
            _id: socket.user._id,
            fullName: socket.user.fullName,
            profilePic: socket.user.profilePic,
          },
        },
      });
    } catch (error) {
      console.error("Error sending group message via socket:", error);
      socket.emit("group:error", { message: "Failed to send message" });
    }
  });

  // Typing indicator for group chat
  socket.on("group:typing", async ({ groupId }) => {
    try {
      const group = await Group.findOne({ _id: groupId, members: userId });
      if (!group) return;

      // Broadcast to group room except sender
      socket.to(`group:${groupId}`).emit("group:typing", {
        groupId,
        userId,
        userInfo: {
          _id: socket.user._id,
          fullName: socket.user.fullName,
        },
      });
    } catch (error) {
      console.error("Error emitting group typing:", error);
    }
  });

  // Stop typing indicator for group chat
  socket.on("group:stop-typing", ({ groupId }) => {
    socket.to(`group:${groupId}`).emit("group:stop-typing", {
      groupId,
      userId,
    });
  });

  // Notify group members when a message is read
  socket.on("group:markAsRead", ({ groupId }) => {
    socket.to(`group:${groupId}`).emit("group:messagesRead", {
      groupId,
      readBy: userId,
    });
  });

  // ========== END GROUP CHAT EVENTS ==========

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.user.fullName);

    if (userSocketsMap[userId]) {
      userSocketsMap[userId].delete(socket.id);
      console.log(`User ${socket.user.fullName} now has ${userSocketsMap[userId].size} socket(s)`);

      if (userSocketsMap[userId].size === 0) {
        for (const callId of Object.keys(activeCalls)) {
          const call = activeCalls[callId];
          if (call.callerId === userId || call.receiverId === userId) {
            const otherUserId = call.callerId === userId ? call.receiverId : call.callerId;

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

export { io, app, server, emitToGroupMembers };