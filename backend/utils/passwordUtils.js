// backend/utils/passwordUtils.js
import bcrypt from "bcryptjs";

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hashed) => {
  return bcrypt.compare(password, hashed);
};
