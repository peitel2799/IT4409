import express from 'express';
import { signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.get("/login", (req, res) => {
  res.send("Login endpoint");
});

router.post("/signup", signup );

router.get("/logout", (req, res) => {
  res.send("Logout endpoint");
})

export default router;