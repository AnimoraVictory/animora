import { z } from 'zod';

export const postBaseSchema = z.object({
  id: z.string().uuid(),
});

export const createPostFormSchema = z.object({
  imageUri: z.string().min(1),
  caption: z.string().min(0),
  userId: z.string().uuid(),
  dailyTaskId: z.string().uuid().optional(),
});

export type CreatePostForm = z.infer<typeof createPostFormSchema>;
