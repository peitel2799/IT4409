import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/messages.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;


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



app.listen(PORT, () => {
  console.log("Server is running on port." + PORT);
  connectDB();
});
