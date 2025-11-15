import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/Use.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.headers.cookie
            ?.split("; ")
            .find((row) => row.startsWith("jwt="))
            ?.split("=")[1];

        if(!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error("Unauthorized - No Token Provider"));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            console.log("Socker connection rejected: Invalid Token");
            return next(new Error("Invalid Token"));
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            console.log("Socker connection rejected: User not found");
            return next(new Error("User not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`)
        next()
    } catch (error) {
        console.log("Error in socket authentication: ", error.message);
        next(new Error("Unauthorized - Authentication failed"));

    }
}