import { z } from "zod";

import { venueSchema } from "@/app/(main)/dashboard/venues/_components/schema";

export type Venue = z.infer<typeof venueSchema>;
