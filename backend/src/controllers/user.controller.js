import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { broadcast } from "../utils/socketNotifier.js";

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

