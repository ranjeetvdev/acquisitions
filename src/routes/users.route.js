import express from "express";

import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from "#controllers/users.controller.js";
import { authenticateToken, requireRole } from "#middleware/auth.middleware.js";

const router = express.Router();

// GET /users - Get all users (Admin only)
router.get("/", authenticateToken, requireRole(["admin"]), fetchAllUsers);

// GET /users/:id - Get user by ID (authenticated user only)
router.get("/:id", authenticateToken, fetchUserById);

// PATCH /users/:id - Update user by ID (authenticated users can update own profile, admins can update any user)
router.patch("/:id", authenticateToken, updateUserById);

// DELETE /users/:id - Delete user by ID (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  deleteUserById,
);

export default router;
