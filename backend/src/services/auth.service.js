import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import { AppError } from "./AppError.js";

// Email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create a new user account
 */
export const signupService = async (fullName, email, password) => {
    // Validation
    if (!fullName || !email || !password) {
        throw new AppError("All fields are required", 400);
    }

    if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters", 400);
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new AppError("Invalid email format", 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("Email already exists", 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
    });

    const savedUser = await newUser.save();

    return {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
    };
};

/**
 * Authenticate a user
 */
export const loginService = async (email, password) => {
    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid credentials", 400);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new AppError("Invalid credentials", 400);
    }

    return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
    };
};

/**
 * Update user profile picture
 */
export const updateProfileService = async (userId, { fullName, profilePic }) => {
    const updateData = {};
    if (fullName) updateData.fullName = fullName; //
    
    if (profilePic) {
        // Upload Base64 lên Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updateData.profilePic = uploadResponse.secure_url; //
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
    ).select("-password");

    return updatedUser;
};

/**
 * Get user by ID (for auth check)
 */
export const getUserByIdService = async (userId) => {
    const user = await User.findById(userId).select("-password");
    return user;
};

/**
 * Change user password
 */
export const changePasswordService = async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        throw new AppError("Current password and new password are required", 400);
    }

    if (newPassword.length < 6) {
        throw new AppError("New password must be at least 6 characters", 400);
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
        throw new AppError("Current password is incorrect", 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return { message: "Password changed successfully" };
};
