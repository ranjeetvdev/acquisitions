import jwt from "jsonwebtoken";

import logger from "#config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES || "15m";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const jwtToken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: "HS256",
        issuer: "acquisitions-api",
      });
    } catch (error) {
      logger.error("Failed to sign token", {
        message: error.message,
      });

      throw new Error("Failed to sign token");
    }
  },

  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "acquisitions-api",
      });
    } catch (error) {
      logger.error("Token verification failed", {
        message: error.message,
      });

      throw error;
    }
  },
};
