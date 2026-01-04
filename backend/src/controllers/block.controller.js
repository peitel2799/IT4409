import {
    blockUserService,
    unblockUserService,
    getBlockedUsersService,
} from "../services/block.service.js";

/**
 * Block a user
 */
export const blockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { userToBlockId } = req.params;

        const result = await blockUserService(userId, userToBlockId);
        res.status(200).json(result);
    } catch (error) {
        console.error("blockUser:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Server error",
        });
    }
};

/**
 * Unblock a user
 */
export const unblockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { userToUnblockId } = req.params;

        const result = await unblockUserService(userId, userToUnblockId);
        res.status(200).json(result);
    } catch (error) {
        console.error("unblockUser:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Server error",
        });
    }
};

/**
 * Get blocked users list
 */
export const getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const blockedUsers = await getBlockedUsersService(userId);
        res.status(200).json(blockedUsers);
    } catch (error) {
        console.error("getBlockedUsers:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Server error",
        });
    }
};
