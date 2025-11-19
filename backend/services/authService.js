// backend/services/authService.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import env from "../config/env.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const registerUser = async ({ name, email, password, phone, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const user = await User.create({ name, email, password, phone, role, location });
  const token = generateToken(user._id, user.role);

  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);

  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};
