import { z } from "zod";

import { userSchema } from "@/app/(main)/dashboard/users/_components/schema";

export type User = z.infer<typeof userSchema>;
