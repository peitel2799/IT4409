import { uploadOnCloudinary } from "../lib/cloudinary.js";
import {
    createGroupService,
    getGroupsByUserIdService,
    getGroupByIdService,
} from "../services/group.service.js";

/**
 * Create a new group
 */
export const createGroup = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, description, memberIds } = req.body;

        let avatar = null;
        if (req.file) {
            avatar = await uploadOnCloudinary(req.file.path);
        }

        // Parse memberIds if it's a string
        let parsedMemberIds = [];
        if (memberIds) {
            if (typeof memberIds === "string") {
                try {
                    parsedMemberIds = JSON.parse(memberIds);
                } catch (e) {
                    parsedMemberIds = memberIds.split(",").map((id) => id.trim());
                }
            } else if (Array.isArray(memberIds)) {
                parsedMemberIds = memberIds;
            }
        }

        const newGroup = await createGroupService(userId, {
            name,
            description,
            memberIds: parsedMemberIds,
            avatar,
        });

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("createGroup:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
};

/**
 * Get all groups for the current user
 */
export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await getGroupsByUserIdService(userId);
        res.status(200).json(groups);
    } catch (error) {
        console.error("getGroups:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
};

/**
 * Get a specific group by ID
 */
export const getGroupById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;
        const group = await getGroupByIdService(groupId, userId);
        res.status(200).json(group);
    } catch (error) {
        console.error("getGroupById:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
};
