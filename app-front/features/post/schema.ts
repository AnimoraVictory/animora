import { z } from 'zod';
import { userBaseSchema } from '../user/schema';
import { commentSchema } from '../comment/schema';
import { likeSchema } from '../like/schema';
import { dailyTaskBaseSchema } from '../dailytask/schema';

export const postBaseSchema = z.object({
  id: z.string().uuid(),
});

export const postSchema = z.object({
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

export type Post = z.infer<typeof postSchema>;

export const getPostResponseSchema = z.object({
  posts: z.array(postSchema),
});

export type GetPostsResponse = z.infer<typeof getPostResponseSchema>;
