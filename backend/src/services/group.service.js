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

  // Ensure creator is included in members
  const uniqueMemberIds = [...new Set([userId.toString(), ...(memberIds || [])])];

  // Validate that all member IDs exist
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

  // Populate before returning
  await newGroup.populate("members", "fullName email profilePic");
  await newGroup.populate("admins", "fullName email profilePic");
  await newGroup.populate("createdBy", "fullName email profilePic");

  return newGroup;
};

/**
 * Get all groups for a user (groups where user is a member)
 */
export const getGroupsByUserIdService = async (userId) => {
  const groups = await Group.find({ members: userId })
    .populate("members", "fullName email profilePic")
    .populate("admins", "fullName email profilePic")
    .populate("createdBy", "fullName email profilePic")
    .sort({ updatedAt: -1 });

  return groups;
};

/**
 * Get a group by ID (only if user is a member)
 */
export const getGroupByIdService = async (groupId, userId) => {
  const group = await Group.findOne({
    _id: groupId,
    members: userId,
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

  const isCreator = group.createdBy.toString() === userId.toString();

  if (isCreator) {
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
      group.createdBy = otherAdmins[0];
    } else {
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

/**
 * Add members to a group (only admins can add)
 */
export const addMembersToGroupService = async (groupId, userId, memberIdsToAdd) => {
  const group = await Group.findOne({
    _id: groupId,
    members: userId,
  });

  if (!group) {
    throw new AppError("Group not found or you are not a member", 404);
  }

  // Check if user is admin
  const isAdmin = group.admins.some(
    (adminId) => adminId.toString() === userId.toString()
  );

  if (!isAdmin) {
    throw new AppError("Only admins can add members", 403);
  }

  if (!memberIdsToAdd || memberIdsToAdd.length === 0) {
    throw new AppError("No members to add", 400);
  }

  // Validate that all member IDs exist
  const newMembers = await User.find({ _id: { $in: memberIdsToAdd } }).select("_id");
  if (newMembers.length !== memberIdsToAdd.length) {
    throw new AppError("Some users not found", 400);
  }

  // Filter out users already in the group
  const existingMemberIds = group.members.map((id) => id.toString());
  const uniqueNewMemberIds = memberIdsToAdd.filter(
    (id) => !existingMemberIds.includes(id.toString())
  );

  if (uniqueNewMemberIds.length === 0) {
    throw new AppError("All users are already members", 400);
  }

  // Add new members
  group.members.push(...uniqueNewMemberIds);
  await group.save();

  // Populate before returning
  await group.populate("members", "fullName email profilePic");
  await group.populate("admins", "fullName email profilePic");
  await group.populate("createdBy", "fullName email profilePic");

  return { group, addedMembers: uniqueNewMemberIds };
};

/**
 * Remove a member from a group (only admins can remove)
 */
export const removeMemberFromGroupService = async (groupId, adminUserId, memberIdToRemove) => {
  const group = await Group.findOne({
    _id: groupId,
    members: adminUserId,
  });

  if (!group) {
    throw new AppError("Group not found or you are not a member", 404);
  }

  // Check if admin user has admin rights
  const isAdmin = group.admins.some(
    (adminId) => adminId.toString() === adminUserId.toString()
  );

  if (!isAdmin) {
    throw new AppError("Only admins can remove members", 403);
  }

  // Check if member to remove exists in the group
  const isMember = group.members.some(
    (memberId) => memberId.toString() === memberIdToRemove.toString()
  );

  if (!isMember) {
    throw new AppError("User is not a member of this group", 404);
  }

  // Prevent removing the creator
  if (group.createdBy.toString() === memberIdToRemove.toString()) {
    throw new AppError("Cannot remove the group creator. Creator must leave the group instead.", 403);
  }

  // Prevent admin from removing themselves (they should use leave group)
  if (adminUserId.toString() === memberIdToRemove.toString()) {
    throw new AppError("Use leave group to remove yourself", 400);
  }

  // Remove member from members array
  group.members = group.members.filter(
    (memberId) => memberId.toString() !== memberIdToRemove.toString()
  );

  // Also remove from admins if they were an admin
  group.admins = group.admins.filter(
    (adminId) => adminId.toString() !== memberIdToRemove.toString()
  );

  await group.save();

  // Populate before returning
  await group.populate("members", "fullName email profilePic");
  await group.populate("admins", "fullName email profilePic");
  await group.populate("createdBy", "fullName email profilePic");

  return { group, removedMemberId: memberIdToRemove };
};

/**
 * Add admin rights to a member (only existing admins can promote)
 */
export const addAdminToGroupService = async (groupId, adminUserId, memberIdToPromote) => {
  const group = await Group.findOne({
    _id: groupId,
    members: adminUserId,
  });

  if (!group) {
    throw new AppError("Group not found or you are not a member", 404);
  }

  // Check if user has admin rights
  const isAdmin = group.admins.some(
    (adminId) => adminId.toString() === adminUserId.toString()
  );

  if (!isAdmin) {
    throw new AppError("Only admins can promote members to admin", 403);
  }

  // Check if member exists in the group
  const isMember = group.members.some(
    (memberId) => memberId.toString() === memberIdToPromote.toString()
  );

  if (!isMember) {
    throw new AppError("User is not a member of this group", 404);
  }

  // Check if member is already an admin
  const isAlreadyAdmin = group.admins.some(
    (adminId) => adminId.toString() === memberIdToPromote.toString()
  );

  if (isAlreadyAdmin) {
    throw new AppError("User is already an admin", 400);
  }

  // Add to admins array
  group.admins.push(memberIdToPromote);
  await group.save();

  // Populate before returning
  await group.populate("members", "fullName email profilePic");
  await group.populate("admins", "fullName email profilePic");
  await group.populate("createdBy", "fullName email profilePic");

  return { group, newAdminId: memberIdToPromote };
};
