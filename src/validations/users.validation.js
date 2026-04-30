import z from "zod";

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Id must be a valid number")
    .transform(Number)
    .refine((val) => val > 0, "Id must be a positive number"),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .max(255, "Email cannot exceed 255 characters")
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must include uppercase, lowercase, number, and special character",
      )
      .optional(),

    role: z.enum(["user", "admin"]).optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one field is provided for update
      return Object.keys(data).length > 0;
    },
    {
      message:
        "Request body must include at least one updatable field: name, email, password, or role",
    },
  );
