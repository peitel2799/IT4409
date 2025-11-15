import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ENV } from "./env.js";

const app = express()
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true
    },
});

io.use(socketAuthMiddleware)


const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.user.fullName);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
