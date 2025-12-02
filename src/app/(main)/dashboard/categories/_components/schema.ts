import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Category title is required").max(100, "Title must be less than 100 characters"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const categoryFormSchema = z.object({
  title: z.string().min(1, "Category title is required").max(100, "Title must be less than 100 characters"),
  image: z
    .union([z.instanceof(File, { message: "Image is required" }), z.string().min(1).optional()])
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Image is required",
    }),
  icon: z
    .union([
      z
        .instanceof(File, { message: "Icon is required" })
        .refine((file) => ["image/svg+xml", "image/png"].includes(file.type), {
          message: "Only SVG or PNG files are allowed",
        }),
      z.string().min(1).optional(),
    ])
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Icon is required",
    }),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
