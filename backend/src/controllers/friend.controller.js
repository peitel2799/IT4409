import User from "../models/User.js";
import {getReceiverSocketId, io} from "../lib/socket.js";

const populateFields = "fullName email profilePic";

export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const {userId: receiverId} = req.params;

        if(senderId.equals(receiverId)) {
            return res.status(400).json({message: "Can't send friendrequest to yourself"});
        }

        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId),
        ]);

        if(!receiver) return res.status(400).json({message: "User not exist!"});
        if(sender.friends.some(id => id.equals(receiverId))){
            return res.status(400).json({message: "Already confirmed"});
        }
        if(sender.sentFriendRequests.some(id => id.equals(receiverId))){
            return res.status(400).json({message: "Already sent"});
        }
        if(receiver.friendRequests.some(id => id.equals(senderId))){
            return res.status(400).json({message: "Already received"});
        }
        sender.sentFriendRequests.push(receiverId);
        receiver.friendRequests.push(senderId);
        await Promise.all([sender.save(), receiver.save()]);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("friendRequestReceived", {from: senderId});
        }

        res.json({message: "FriendRequestSent"});
    }catch(error){
        console.error("sendFriendRequest:", error);
        res.status(500).json({message: "Server error"});

    }
}

export const acceptFriendRequest = async (req, res) => {
    try{
        const receiverId = req.user._id;
        const {userId: senderId} = req.params;

        const [receiver, sender] = await Promise.all([
            User.findById(receiverId),
            User.findById(senderId),
        ]);

        if(!sender) return res.status(404).json({message: "Not existed"});
        if(!receiver) return res.status(404).json({message: "Receiver not found"});
        if(!receiver.friendRequests.some(id => id.equals(senderId))){
            return res.status(400).json({message: "Not found"});
        }
        receiver.friendRequests = receiver.friendRequests.filter(id => !id.equals(senderId));
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !id.equals(receiverId));

        receiver.friends.push(senderId);
        sender.friends.push(receiverId);

        await Promise.all([receiver.save(), sender.save()]);
        const senderSocketId = getReceiverSocketId(senderId);
        if(senderSocketId){
            io.to(senderSocketId).emit("friendRequestAccepted", {by: receiverId});
        }
        res.json({message: "FriendRequestAccepted"});
    }catch(error){
        console.error("acceptFriendRequest:", error);
        res.status(500).json({message: "Server error"});

    }
}

export const rejectFriendRequest = async (req, res) => {
    try{
        const receiverId = req.user._id;
        const {userId: senderId} = req.params;

        const [receiver, sender] = await Promise.all([
            User.findById(receiverId),
            User.findById(senderId),
        ]);

        if(!sender) return res.status(404).json({message: "Not existed"});
        if(!receiver) return res.status(404).json({message: "Receiver not found"});

        receiver.friendRequests = receiver.friendRequests.filter(id => !id.equals(senderId));
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !id.equals(receiverId));

        await Promise.all([receiver.save(), sender.save()]);

        res.json({message: "FriendRequestRejected"});
    }catch(error){
        console.error("rejectFriendRequest:", error);
        res.status(500).json({message: "Server error"});

    }
}

export const cancelFriendRequest = async (req, res) => {
    try{
        const senderId = req.user._id;
        const {userId: receiverId} = req.params;

        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId),
        ]);

        if(!receiver) return res.status(404).json({message: "Not existed"});
        if(!sender) return res.status(404).json({message: "Sender not found"});

        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !id.equals(receiverId));
        receiver.friendRequests = receiver.friendRequests.filter(id => !id.equals(senderId));

        await Promise.all([sender.save(), receiver.save()]);
        res.json({message: "FriendRequestCancelled"});
    }catch(error){
        console.error("cancelFriendRequest:", error);
        res.status(500).json({message: "Server error"});

    } 
}

export const removeFriend = async (req, res) => {
    try{
        const userId = req.user._id;
        const {userId: friendId} = req.params;

        const [user, friend] = await Promise.all([
            User.findById(userId),
            User.findById(friendId),
        ]);

        if(!friend) return res.status(404).json({message: "Friend not found"});
        if(!user.friends.some(id => id.equals(friendId))){
            return res.status(400).json({message: "Not a friend"});
        }
        user.friends = user.friends.filter(id => !id.equals(friendId));
        friend.friends = friend.friends.filter(id => !id.equals(userId));

        await Promise.all([user.save(), friend.save()]);

        res.json({message: "Friend removed"});

    }catch(error){
        console.error("removeFriend:", error);
        res.status(500).json({message: "Server error"});
    }
};

export const getFriendRequests = async(req, res) =>{
    try{
        const user = await User.findById(req.user._id).populate({path:"friendRequests", select: populateFields});

        res.json(user.friendRequests || []);
    }catch(error){
        console.error("getFriendRequests:", error);
        res.status(500).json({message: "Server error"});
    }
};

export const getFriends = async(req, res) =>{
    try{
        const user = await User.findById(req.user._id).populate({path:"friends", select: populateFields});
        res.json(user.friends || []);
    }catch(error){
        console.error("getFriends:", error);
        res.status(500).json({message: "Server error"});
    }
};

export const searchUsers = async(req, res) =>{
    try{
        const {q = "", excludeFriends = "true"} = req.query;
        const currentUser = await User.findById(req.user._id);

        const regex = new RegExp(q, "i");
        const candidates = await User.find({
            _id: {$ne: currentUser._id},
            $or: [{fullName: regex}, {email: regex}],
        }).select("fullName email profilePic");

        const response = candidates.map(user => {
            const isFriend = currentUser.friends.some(id => id.equals(user._id));
            if(excludeFriends === "true" && isFriend) return null;

            const hasSentRequest = currentUser.sentFriendRequests.some(id => id.equals(user._id));
            const hasReceivedRequest = currentUser.friendRequests.some(id => id.equals(user._id));

            let status = "none";
            if(isFriend) status = "friend";
            else if(hasSentRequest) status = "pending";
            else if(hasReceivedRequest) status = "incoming";

            return {...user.toObject(), status};
        }).filter(Boolean);

        res.json(response);

    }catch(error){
        console.error("searchUsers:", error);
        res.status(500).json({message: "Server error"});
    }
};



