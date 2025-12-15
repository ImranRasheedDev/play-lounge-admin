import { z } from "zod";

// Banner schema
export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  video: z.union([z.instanceof(File), z.string()]).optional(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

// Primary Sponsored Venue schema
export const primarySponsoredVenueSchema = z.object({
  venueId: z.string().min(1, "Please select a venue"),
  video: z.union([z.instanceof(File), z.string()]).optional(),
});

export type PrimarySponsoredVenueFormValues = z.infer<typeof primarySponsoredVenueSchema>;

// Homepage Card schema
export const homepageCardSchema = z.object({
  icon: z.union([z.instanceof(File), z.string()]).optional(),
  heading: z.string().min(1, "Heading is required"),
  para: z.string().min(1, "Description is required"),
});

export type HomepageCardFormValues = z.infer<typeof homepageCardSchema>;

// Homepage Cards array schema
export const homepageCardsSchema = z.object({
  cards: z.array(homepageCardSchema).min(1, "At least one card is required"),
});

export type HomepageCardsFormValues = z.infer<typeof homepageCardsSchema>;

// Event Concierge schema
export const eventConciergeSchema = z.object({
  subtitle: z.string().min(1, "Subtitle is required"),
  title: z.string().min(1, "Title is required"),
  para: z.string().min(1, "Description is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type EventConciergeFormValues = z.infer<typeof eventConciergeSchema>;
