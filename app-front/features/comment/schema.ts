import { z } from "zod";
import { userBaseSchema } from "../user/schema";

export const commentSchema = z.object({
  id: z.string(),
  user: userBaseSchema,
  content: z.string(),
  createdAt: z.string().datetime(),
});

export type Comment = z.infer<typeof commentSchema>;
