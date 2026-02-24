import { z } from "zod";

import { userSchema } from "@/app/(main)/dashboard/users/_components/schema";

export type User = z.infer<typeof userSchema>;

export interface UserSavedVenue {
  id: string;
  name: string;
  address: string;
  thumbnail?: string;
  isSponsored: boolean;
  isTrending: boolean;
  latitude?: number;
  longitude?: number;
  venueLink?: string;
  route?: string;
  city?: string;
}
