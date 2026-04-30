import logger from "#config/logger.js";
import { jwtToken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";
import { authenticateUser, createUser } from "#services/auth.service.js";
import { formatValidationError } from "#utils/format.js";
import { signInSchema, signupSchema } from "#validations/auth.validation.js";

export const signUp = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success)
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, "token", token);

    logger.info(`User signed up successfully: ${user.id}`);
    res.status(201).json({
      success: true,
      message: "User Created",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Signup error", error);

    if (error.message === "Unable to create account") {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
      });
    }

    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success)
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, "token", token);

    logger.info(`User signed in successfully: ${user.id}`);
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Sign in error: ", error);

    if (
      error.message === "User not found" ||
      error.message === "Invalid password"
    )
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    next(error);
  }
};

export const signOut = (req, res, next) => {
  try {
    cookies.clear(res, "token");

    logger.info("User signed out successfully");
    res.status(200).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    logger.error("Sign out error: ", error);
    next(error);
  }
};
