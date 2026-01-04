import User from "../models/User.js";
import { AppError } from "./AppError.js";

/**
 * Block a user (mark as spam)
 */
export const blockUserService = async (userId, userToBlockId) => {
    if (userId === userToBlockId) {
        throw new AppError("Cannot block yourself", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const userToBlock = await User.findById(userToBlockId);
    if (!userToBlock) {
        throw new AppError("User to block not found", 404);
    }

    // Check if already blocked
    if (user.blockedUsers.includes(userToBlockId)) {
        throw new AppError("User is already blocked", 400);
    }

    // Add to blocked list
    user.blockedUsers.push(userToBlockId);
    await user.save();

    return {
        success: true,
        message: "User blocked successfully",
    };
};

/**
 * Unblock a user (remove spam flag)
 */
export const unblockUserService = async (userId, userToUnblockId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Check if user is blocked
    if (!user.blockedUsers.includes(userToUnblockId)) {
        throw new AppError("User is not blocked", 400);
    }

    // Remove from blocked list
    user.blockedUsers = user.blockedUsers.filter(
        (id) => id.toString() !== userToUnblockId.toString()
    );
    await user.save();

    return {
        success: true,
        message: "User unblocked successfully",
    };
};

/**
 * Get list of blocked users
 */
export const getBlockedUsersService = async (userId) => {
    const user = await User.findById(userId).populate(
        "blockedUsers",
        "fullName email profilePic"
    );

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user.blockedUsers || [];
};
