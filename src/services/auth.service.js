import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import logger from "#config/logger.js";
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing the password: ${error}`);
    throw new Error("Error hashing");
  }
};

export const createUser = async ({ name, email, password, role = "user" }) => {
  try {
    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User ${newUser.id} created successfully`);
    return newUser;
  } catch (error) {
    // Handle unique constraint violation (code depends on your DB driver)
    if (error.code === "23505") throw new Error("Unable to create account");

    logger.error(`Error creating the user: ${error}`);
    throw error;
  }
};
