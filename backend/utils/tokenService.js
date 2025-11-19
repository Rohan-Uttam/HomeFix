import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Generate JWT token
 * @param {Object} payload - { id, role }
 * @param {String} expiresIn - default 7d
 */
export function generateToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
}
