import { z } from "zod";

// Tag with images schema
export const tagWithImagesSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  images: z.array(z.string()).min(1, "At least one image is required for each tag"),
});

// Experience schema
export const experienceSchema = z.object({
  id: z.string().optional(),
  image: z.string(),
  heading: z.string().min(1, "Heading is required"),
  subHeading: z.string().min(1, "Sub heading is required"),
  description: z.string().min(1, "Description is required"),
});

// Day hours schema
export const dayHoursSchema = z.object({
  isOpen: z.boolean().default(false),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

// Open hours schema for all days
export const openHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

export const venueSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Venue name is required").max(200, "Name must be less than 200 characters"),
  categoryId: z.union([z.string().min(1), z.array(z.string()).min(1)]).refine((val) => {
    if (Array.isArray(val)) {
      return val.length > 0;
    }
    return typeof val === "string" && val.length > 0;
  }, "At least one category is required"),
  venueTypeId: z.string().min(1, "Venue type is required"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().optional(),
  placeId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  overview: z.string().optional(),
  googleReviewsLink: z.string().optional(),
  venueLink: z.string().optional(),
  thumbnail: z.string().optional(),
  images: z.array(tagWithImagesSchema).default([]),
  experiences: z.array(experienceSchema).default([]),
  // Highlights
  atmosphere: z.string().optional(),
  foodOptions: z.string().optional(),
  dressCode: z.string().optional(),
  accessibility: z.string().optional(),
  seated: z.string().optional(),
  standing: z.string().optional(),
  openHours: openHoursSchema.optional(),
  isActive: z.boolean().default(true),
  isSponsored: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const venueFormSchema = z.object({
  name: z.string().min(1, "Venue name is required").max(200, "Name must be less than 200 characters"),
  categoryId: z.array(z.string()).min(1, "At least one category is required"),
  venueTypeId: z.string().min(1, "Venue type is required"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().optional(),
  placeId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Address components from Google Places
  streetNumber: z.string().optional(),
  route: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  overview: z.string().min(1, "Overview is required"),
  googleReviewsLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  venueLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  thumbnail: z
    .union([
      z.instanceof(File),
      z.string(), // For existing thumbnail URL
    ])
    .optional()
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Thumbnail is required",
    }),
  images: z
    .array(
      z.object({
        name: z.string().min(1, "Tag name is required"),
        images: z
          .array(z.union([z.instanceof(File), z.string()]))
          .min(1, "At least one image is required for each tag"),
      }),
    )
    .min(1, "At least one image tag is required"),
  experiences: z
    .array(
      z.object({
        image: z.union([z.instanceof(File), z.string()]),
        heading: z.string().min(1, "Heading is required"),
        subHeading: z.string().min(1, "Sub heading is required"),
        description: z.string().min(1, "Description is required"),
      }),
    )
    .default([]),
  // Highlights (all required)
  atmosphere: z.string().min(1, "Atmosphere is required"),
  foodOptions: z.string().min(1, "Food options are required"),
  dressCode: z.string().min(1, "Dress code is required"),
  accessibility: z.string().min(1, "Accessibility is required"),
  seated: z.string().min(1, "Seated capacity is required"),
  standing: z.string().min(1, "Standing capacity is required"),
  openHours: openHoursSchema.optional().refine(
    (hours) => {
      if (!hours) return false;
      // Check if at least one day is open
      return Object.values(hours).some((day) => day.isOpen === true);
    },
    {
      message: "At least one day must be open",
    },
  ),
  isActive: z.boolean().default(true),
  isSponsored: z.boolean().default(false),
  isTrending: z.boolean().default(false),
});

export type VenueFormValues = z.infer<typeof venueFormSchema>;
