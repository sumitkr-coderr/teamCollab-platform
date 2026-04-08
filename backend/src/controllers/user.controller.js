import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { broadcast } from "../utils/socketNotifier.js";
import bcrypt from "bcrypt";

const { User } = db;

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role", "isActive", "createdAt", "avatar"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await broadcast("activity", {
      userId: userId,
      message: `${req.user?.name || req.user?.id} viewed their profile`,
      // just an activity log, don't persist
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   message: "Something went wrong",
    // });
     console.log("JWT ERROR:", error);
  return res.status(401).json({
    success: false,
    message: "Not authorized, invalid token",
  });
  }
};

export const uploadAvatar = async (req, res) => {
  
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* Delete old avatar */
    if (user.avatar) {
      const oldAvatarRelative = user.avatar.replace(/^\//, "");
      const oldPath = path.join(process.cwd(), oldAvatarRelative);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    /* Save new avatar */
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
   
    user.avatar = avatarPath;
    await user.save();

    broadcast("activity", {
      userId: userId,
      message: `${req.user?.name || req.user?.id} updated their avatar`,
      persist: true,
    });

    res.json({
      success: true,
      avatar: avatarPath,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Avatar upload failed",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email","avatar"],
    });

    await broadcast("activity", {
      userId: req.user?.id,
      message: `${req.user?.name || req.user?.id} fetched all users`,
      // read action only
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const findAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email","avatar"],
    });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

import crypto from "crypto";

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔐 Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ⏳ Expiry (15 minutes)
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // 💾 Save to DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;

    await user.save();

    // 🔗 Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 📢 Broadcast activity
    await broadcast("activity", {
      userId: user.id,
      message: `${user.name || user.id} requested a password reset`,
      persist: true,
    });

    // 📧 (Simulated email)
    console.log("Reset Link:", resetURL);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
      const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
      if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null; 
    await user.save();
      await broadcast("activity", {
      userId: user.id,
      message: `${user.name || user.id} reset their password`,
      persist: true,
    });
      res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  }

    catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};