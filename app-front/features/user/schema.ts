import { z } from 'zod';
import { postSchema } from '../post/schema';
import { dailyTaskSchema } from '../dailytask/schema';
import { petSchema } from '../pet/schema';

export const userBaseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  bio: z.string(),
  iconImageUrl: z.string().nullable(),
});

export type UserBase = z.infer<typeof userBaseSchema>;

export const userSchema = userBaseSchema.extend({
  followers: z.array(userBaseSchema),
  follows: z.array(userBaseSchema),
  followersCount: z.number(),
  followsCount: z.number(),
  posts: z.array(postSchema),
  pets: z.array(petSchema),
  dailyTask: dailyTaskSchema,
});

export type User = z.infer<typeof userSchema>;
