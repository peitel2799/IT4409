import Call from "../models/Call.js";

// Get call history for current user
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get calls where user is either caller or receiver
    const calls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller", "fullName profilePic")
      .populate("receiver", "fullName profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Call.countDocuments({
      $or: [{ caller: userId }, { receiver: userId }],
    });

    // Transform calls to include direction info
    const transformedCalls = calls.map((call) => {
      const isOutgoing = call.caller._id.toString() === userId.toString();
      return {
        _id: call._id,
        callId: call.callId,
        callType: call.callType,
        status: call.status,
        duration: call.duration,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        createdAt: call.createdAt,
        direction: isOutgoing ? "outgoing" : "incoming",
        // The other person in the call
        contact: isOutgoing ? call.receiver : call.caller,
      };
    });

    res.status(200).json({
      success: true,
      calls: transformedCalls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call history",
    });
  }
};

// Get call statistics
export const getCallStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Call.aggregate([
      {
        $match: {
          $or: [{ caller: userId }, { receiver: userId }],
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          answeredCalls: {
            $sum: { $cond: [{ $eq: ["$status", "answered"] }, 1, 0] },
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] },
          },
          totalDuration: { $sum: "$duration" },
          videoCalls: {
            $sum: { $cond: [{ $eq: ["$callType", "video"] }, 1, 0] },
          },
          audioCalls: {
            $sum: { $cond: [{ $eq: ["$callType", "audio"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        totalDuration: 0,
        videoCalls: 0,
        audioCalls: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching call stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call statistics",
    });
  }
};

// Delete a call record
export const deleteCallRecord = async (req, res) => {
  try {
    const userId = req.user._id;
    const { callId } = req.params;

    const call = await Call.findOne({
      _id: callId,
      $or: [{ caller: userId }, { receiver: userId }],
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call record not found",
      });
    }

    await Call.deleteOne({ _id: callId });

    res.status(200).json({
      success: true,
      message: "Call record deleted",
    });
  } catch (error) {
    console.error("Error deleting call record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete call record",
    });
  }
};
