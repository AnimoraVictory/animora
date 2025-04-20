import { isValidDate } from '@/utils/date';
import { z } from 'zod';

export const petSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['dog', 'cat'], { required_error: '種類は必須です' }),
  species: z.string().min(1),
  birthDay: z.string().min(1),
});

export type Pet = z.infer<typeof petSchema>;

export const petFormSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  petType: z.enum(['dog', 'cat'], { required_error: '種類は必須です' }),
  species: z.string().min(1, { message: '品種を選択してください' }),
  birthDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: '誕生日はYYYY-MM-DD形式で入力してください',
    })
    .refine((dateStr) => isValidDate(dateStr), {
      message: '存在する日付を入力してください',
    }),
  iconImageUri: z.string().nullable(),
});

export type PetForm = z.infer<typeof petFormSchema>;
