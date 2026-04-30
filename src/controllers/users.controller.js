import logger from "#config/logger.js";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "#services/users.service.js";
import { hashPassword } from "#src/utils/bcrypt.js";
import { formatValidationError } from "#utils/format.js";
import {
  updateUserSchema,
  userIdSchema,
} from "#validations/users.validation.js";

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info("Getting users...");

    const allUsers = await getAllUsers();

    res.json({
      success: true,
      message: "Successfully retrieved users",
      data: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate the user ID parameter
    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success)
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });

    const { id } = validationResult.data;
    if (!req.user)
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "You must be logged in to view user information",
      });

    if (req.user.role !== "admin" && req.user.id !== id)
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You can only view your own information",
      });
    logger.info(`Getting user by id: ${id}`);

    const user = await getUserById(id);

    logger.info(`User ${id} retrieved successfully`);
    res.json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    logger.error(`Error fetching user by id: ${error.message}`);

    if (error.message === "User not found")
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate the user ID parameter
    const idValidationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!idValidationResult.success)
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(idValidationResult.error),
      });

    const { id } = idValidationResult.data;
    logger.info(`Updating user: ${id}`);

    // Validate the update data
    const updateValidationResult = updateUserSchema.safeParse(req.body);

    if (!updateValidationResult.success)
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(updateValidationResult.error),
      });

    const updates = updateValidationResult.data;

    // Authorization checks
    if (!req.user)
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "You must be logged in to update the user information",
      });

    // Allow users to update only their own information (except role)
    if (req.user.role !== "admin" && req.user.id !== id)
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You can only update your information",
      });

    // Only admin users can change roles
    if (updates.role && req.user.role !== "admin")
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "Only administrators can change user roles",
      });

    if (updates.password)
      updates.password = await hashPassword(updates.password);

    const updatedUser = await updateUser(id, updates);

    logger.info(`User ${id} updated successfully`);
    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);

    if (error.message === "User not found")
      return res.status(404).json({
        success: false,
        error: "User not found",
      });

    if (error.message === "Email already exists")
      return res.status(409).json({
        success: false,
        error: "Email already exists",
      });

    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    // Validate the user ID parameter
    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success)
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });

    const { id } = validationResult.data;
    logger.info(`Deleting user: ${id}`);

    // Authorization checks
    if (!req.user)
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "You must be logged in to delete users",
      });

    // Only admin users can delete users (prevent self-deletion or user deletion by non-admins)
    if (req.user.role !== "admin")
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "Only administrators can delete users",
      });

    // Prevent admins from deleting themselves
    if (req.user.id === id)
      return res.status(403).json({
        success: false,
        error: "Operation denied",
        message: "You can't delete your own account",
      });

    const deletedUser = await deleteUser(id);
    logger.info(`User ${id} deleted successfully`);

    res.json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);

    if (error.message === "User not found")
      return res.status(404).json({
        success: false,
        error: "User not found",
      });

    next(error);
  }
};
