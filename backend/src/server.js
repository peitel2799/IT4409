import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 5173;

app.use(express.json({ limit: "5mb" })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  const buildPath = path.resolve(__dirname, "../frontend/build");
  const indexHtmlPath = path.resolve(buildPath, "index.html");

  app.use(express.static(buildPath));

  app.get("*", (_, res) => {
    res.sendFile(indexHtmlPath, (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(404).send("index.html not found");
      }
    });
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});