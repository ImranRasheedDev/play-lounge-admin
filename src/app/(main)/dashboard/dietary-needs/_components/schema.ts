import { z } from "zod";

export const dietaryNeedSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const dietaryNeedFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  isActive: z.boolean().default(true),
});

export type DietaryNeedFormValues = z.infer<typeof dietaryNeedFormSchema>;
