import { z } from 'zod';
import { userBaseSchema } from '../user/schema';

export const likeSchema = z.object({
  id: z.string(),
  user: userBaseSchema,
  createdAt: z.string().datetime(),
});

export type Like = z.infer<typeof likeSchema>;
