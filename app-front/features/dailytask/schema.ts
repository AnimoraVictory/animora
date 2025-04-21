import { z } from 'zod';
import { postBaseSchema } from '../post/schema';

export const dailyTaskBaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  type: z.string(),
});

export const dailyTaskSchema = dailyTaskBaseSchema.extend({
  post: postBaseSchema.optional().nullable(),
});

export type DailyTask = z.infer<typeof dailyTaskSchema>;
