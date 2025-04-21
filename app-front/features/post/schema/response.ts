import { commentSchema } from '@/features/comment/schema';
import { dailyTaskBaseSchema } from '@/features/dailytask/schema';
import { likeSchema } from '@/features/like/schema';
import { userBaseSchema } from '@/features/user/schema';
import { z } from 'zod';

export const postResponseSchema = z.object({
  id: z.string().uuid(),
  caption: z.string().min(0),
  imageUrl: z.string().min(1),
  user: userBaseSchema,
  comments: z.array(commentSchema),
  commentsCount: z.number(),
  likes: z.array(likeSchema),
  likesCount: z.number(),
  createdAt: z.string().datetime(),
  dailyTask: dailyTaskBaseSchema.optional().nullable(),
});

export type PostResponse = z.infer<typeof postResponseSchema>;

export const getPostsResponseSchema = z.object({
  posts: z.array(postResponseSchema),
});

export type GetPostsResponse = z.infer<typeof getPostsResponseSchema>;
