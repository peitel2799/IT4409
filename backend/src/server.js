import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/messages.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
const __dirname = path.resolve();

const PORT = ENV.PORT;

app.use(express.json("limit "));
app.use(cookieParser());


app.use(express.json()); // Middleware to parse JSON request.body

app.use("/api/auth",authRoutes );
app.use("/api/messages",messageRoutes );

//make ready deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend","dist","index.html"));
  });

}

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    connectDB()
});


app.listen(PORT, () => {
  console.log("Server is running on port." + PORT);
  connectDB();
});
