import Call from "../models/Call.js";
import { ENV } from "../lib/env.js";

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
      .populate("caller", "fullName profilePic email")
      .populate("receiver", "fullName profilePic email")
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

// Get TURN server configuration
export const getTurnConfig = async (req, res) => {
  try {
    const cloudflareToken = ENV.CLOUDFLARE_TURN_TOKEN;

    // Base STUN servers (always included)
    const stunServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ];

    let turnServers = [];
    let usingCloudflare = false;

    // Use Cloudflare TURN servers if token is provided
    if (cloudflareToken && cloudflareToken !== 'your_turn_token_here') {
      usingCloudflare = true;
      turnServers = [
        {
          urls: "turn:turn.cloudflare.com:3478",
          username: "cloudflare",
          credential: cloudflareToken,
        },
        {
          urls: "turn:turn.cloudflare.com:3478?transport=tcp",
          username: "cloudflare",
          credential: cloudflareToken,
        },
        {
          urls: "turns:turn.cloudflare.com:5349",
          username: "cloudflare",
          credential: cloudflareToken,
        },
        {
          urls: "turns:turn.cloudflare.com:5349?transport=tcp",
          username: "cloudflare",
          credential: cloudflareToken,
        },
      ];
    } else {
      // Fallback to free TURN servers
      turnServers = [
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:a.relay.metered.ca:80",
          username: "87e89a13c60b75feb7ed",
          credential: "mOYOjI8eTN3gbnCa",
        },
        {
          urls: "turn:a.relay.metered.ca:443",
          username: "87e89a13c60b75feb7ed",
          credential: "mOYOjI8eTN3gbnCa",
        },
        {
          urls: "turn:a.relay.metered.ca:443?transport=tcp",
          username: "87e89a13c60b75feb7ed",
          credential: "mOYOjI8eTN3gbnCa",
        },
      ];
    }

    res.status(200).json({
      success: true,
      iceServers: [...stunServers, ...turnServers],
      iceCandidatePoolSize: 10,
      provider: usingCloudflare ? "cloudflare" : "free",
    });
  } catch (error) {
    console.error("Error getting TURN config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get TURN configuration",
    });
  }
};

