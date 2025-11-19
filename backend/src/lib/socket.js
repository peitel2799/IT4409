import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";
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

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle sending messages via socket
  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, text, image } = data;
      const senderId = socket.userId;

      // Create new message document
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image,
        isRead: false,
      });

      await newMessage.save();

      // Emit message to receiver if online
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);
      }

      // Emit confirmation back to sender
      socket.emit("messageSent", newMessage);
    } catch (error) {
      console.log("Error in sendMessage socket event:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Update all messages from partnerId sent to myUserId to "seen"
  socket.on("markAsRead", async (data) => {
    try {
      const { partnerId } = data;
      const myUserId = socket.userId;

      await Message.updateMany(
        {
          senderId: partnerId,
          receiverId: myUserId,
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      // Notify sender that their messages were read
      const senderSocketId = getReceiverSocketId(partnerId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          partnerId: myUserId.toString(),
        });
      }
    } catch (error) {
      console.log("Error marking messages as read: ", error);
    }
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };