import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "USER"]),
  isActive: z.boolean(),
  lastLogin: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserSchema = z.infer<typeof userSchema>;
