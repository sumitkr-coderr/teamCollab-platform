import bcrypt from "bcrypt";
import db from "../models/index.js";
import { hashPassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import { broadcast } from "../utils/socketNotifier.js";

const { User, Notification } = db;

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // notify others of new registration
  await Notification.create({
    userId: user.id,
    message: `New user registered: ${user.name || user.email}`,
    type: "USER_REGISTERED",
  });
  await broadcast("activity", {
    userId: user.id,
    message: `New user registered: ${user.name || user.email}`,
    persist: true,
  });

  return user;
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });

  // broadcast login activity

  await Notification.create({
    userId: user.id,
    message: `User logged in: ${user.name || user.email}`,
    type: "USER_LOGGED_IN",
  });
  await broadcast("activity", {
    userId: user.id,
    message: `User logged in: ${user.name || user.email}`,
  });

  return { user, token };
};

export const upLoadAvatarService = async (userId, avatarUrl) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.avatar = avatarUrl;
  await user.save();

  await Notification.create({
    userId,
    message: `User ${user.name || user.email} updated their avatar`,
    type: "AVATAR_UPDATED",
  });

  await broadcast("activity", {
    userId,
    message: `User ${userId} updated their avatar`,
    persist: true,
  });

  return user;
};

export const vertifyTokenService = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new Error("User not found");
    } else {
      return user;
    } 
  } catch (error) {
    throw new Error("Invalid token");
  } 
};