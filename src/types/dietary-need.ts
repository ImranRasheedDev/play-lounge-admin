import { z } from "zod";

import { dietaryNeedSchema } from "@/app/(main)/dashboard/dietary-needs/_components/schema";

export type DietaryNeed = z.infer<typeof dietaryNeedSchema>;
