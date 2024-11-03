import Group from "../models/Group.js";
import User from "../models/User.js";
import { AppError } from "./AppError.js";

/**
 * Create a new group
 */
export const createGroupService = async (userId, { name, description, memberIds, avatar }) => {
    if (!name || name.trim().length === 0) {
        throw new AppError("Group name is required", 400);
    }

    if (name.trim().length > 100) {
        throw new AppError("Group name must be less than 100 characters", 400);
    }

    // Validate that all member IDs exist and are valid
    const uniqueMemberIds = [...new Set([userId, ...(memberIds || [])])];
    const members = await User.find({ _id: { $in: uniqueMemberIds } }).select("_id");

    if (members.length !== uniqueMemberIds.length) {
        throw new AppError("Some members not found", 400);
    }

    // Create group - creator is automatically an admin and member
    const newGroup = new Group({
        name: name.trim(),
        description: description?.trim() || "",
        avatar: avatar || "",
        members: uniqueMemberIds,
        admins: [userId], // Creator is admin
        createdBy: userId,
    });

    await newGroup.save();
    
    // Populate members and admins before returning
    await newGroup.populate("members", "fullName email profilePic");
    await newGroup.populate("admins", "fullName email profilePic");
    await newGroup.populate("createdBy", "fullName email profilePic");

    return newGroup;
};

/**
 * Get all groups for a user (groups where user is a member)
 */
export const getGroupsByUserIdService = async (userId) => {
    const groups = await Group.find({
        members: userId,
    })
        .populate("members", "fullName email profilePic")
        .populate("admins", "fullName email profilePic")
        .populate("createdBy", "fullName email profilePic")
        .sort({ updatedAt: -1 }); // Most recently updated first

    return groups;
};

/**
 * Get a group by ID (only if user is a member)
 */
export const getGroupByIdService = async (groupId, userId) => {
    const group = await Group.findOne({
        _id: groupId,
        members: userId, // User must be a member
    })
        .populate("members", "fullName email profilePic")
        .populate("admins", "fullName email profilePic")
        .populate("createdBy", "fullName email profilePic");

    if (!group) {
        throw new AppError("Group not found or you are not a member", 404);
    }

    return group;
};

/**
 * Leave a group
 */
export const leaveGroupService = async (groupId, userId) => {
    const group = await Group.findOne({
        _id: groupId,
        members: userId,
    });

    if (!group) {
        throw new AppError("Group not found or you are not a member", 404);
    }

    // Check if user is the creator
    const isCreator = group.createdBy.toString() === userId.toString();
    
    if (isCreator) {
        // If creator is leaving, we have options:
        // 1. Delete the group if they're the only member
        // 2. Transfer ownership to another admin
        // 3. Just prevent them from leaving (current approach for simplicity)
        
        if (group.members.length === 1) {
            // Only member, delete the group
            await Group.findByIdAndDelete(groupId);
            return { deleted: true, groupId };
        }
        
        // Transfer creator role to another admin or member
        const otherAdmins = group.admins.filter(
            (adminId) => adminId.toString() !== userId.toString()
        );
        
        if (otherAdmins.length > 0) {
            // Transfer to first admin
            group.createdBy = otherAdmins[0];
        } else {
            // No other admins, promote first other member
            const otherMembers = group.members.filter(
                (memberId) => memberId.toString() !== userId.toString()
            );
            if (otherMembers.length > 0) {
                group.createdBy = otherMembers[0];
                group.admins.push(otherMembers[0]);
            }
        }
    }

    // Remove user from members and admins
    group.members = group.members.filter(
        (memberId) => memberId.toString() !== userId.toString()
    );
    group.admins = group.admins.filter(
        (adminId) => adminId.toString() !== userId.toString()
    );

    await group.save();

    return { deleted: false, group };
};
