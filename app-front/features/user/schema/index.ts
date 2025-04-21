import { z } from 'zod';

export const userBaseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  bio: z.string(),
  iconImageUrl: z.string().nullable(),
});

export type UserBase = z.infer<typeof userBaseSchema>;

export const profileEditSchema = z.object({
  imageUri: z.string().nullable(),
  name: z.string().min(1, { message: '名前は必須です' }),
  bio: z.string().min(0),
});

export type ProfileEditForm = z.infer<typeof profileEditSchema>;
