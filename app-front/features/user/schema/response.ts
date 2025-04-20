import { z } from 'zod';
import { userBaseSchema } from '.';
import { petSchema } from '@/features/pet/schema';
import { dailyTaskSchema } from '@/features/dailytask/schema';
import { postResponseSchema } from '@/features/post/schema/response';

export const userResponseSchema = userBaseSchema.extend({
  followers: z.array(userBaseSchema),
  follows: z.array(userBaseSchema),
  followersCount: z.number(),
  followsCount: z.number(),
  posts: z.array(postResponseSchema),
  pets: z.array(petSchema),
  dailyTask: dailyTaskSchema,
});

export type UserResponse = z.infer<typeof userResponseSchema>;
