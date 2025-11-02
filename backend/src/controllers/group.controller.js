import {
  createGroupService,
  getGroupsByUserIdService,
  getGroupByIdService,
  leaveGroupService,
} from "../services/group.service.js";

/**
 * Create a new group
 * POST /api/groups
 */
export const createGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description, memberIds, avatar } = req.body;

    const group = await createGroupService(userId, {
      name,
      description,
      memberIds,
      avatar,
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (error) {
    console.error("Error in createGroup controller:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all groups for the authenticated user
 * GET /api/groups
 */
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await getGroupsByUserIdService(userId);

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error in getMyGroups controller:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get a specific group by ID
 * GET /api/groups/:groupId
 */
export const getGroupById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const group = await getGroupByIdService(groupId, userId);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error in getGroupById controller:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Leave a group
 * POST /api/groups/:groupId/leave
 */
export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const result = await leaveGroupService(groupId, userId);

    res.status(200).json({
      success: true,
      message: result.deleted
        ? "Group deleted (you were the last member)"
        : "Left the group successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in leaveGroup controller:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
