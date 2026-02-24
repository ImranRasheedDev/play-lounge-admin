import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  role: z.enum(["SUPER_ADMIN", "USER"]),
  isActive: z.boolean(),
  isEmailVerified: z.boolean().optional(),
  lastLogin: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserSchema = z.infer<typeof userSchema>;

// Schema for admin update user form
export const adminUpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean(),
});

export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;

// Schema for admin reset password form
export const adminResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AdminResetPasswordFormValues = z.infer<typeof adminResetPasswordSchema>;
