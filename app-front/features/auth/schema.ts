import { z } from 'zod';
import { userResponseSchema } from '../user/schema/response';

export const signInFormSchema = z.object({
  email: z
    .string()
    .email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上必要です' }),
});

export type SignInForm = z.infer<typeof signInFormSchema>;

export const loginResponseSchema = z.object({
  message: z.string(),
  user: userResponseSchema,
  accessToken: z.string().min(1),
  idToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const signUpResponseSchema = z.object({
  message: z.string(),
  user: userResponseSchema,
});

export type SignUpResponse = z.infer<typeof signUpResponseSchema>;

export const signUpFormSchema = z.object({
  name: z.string(),
  email: z
    .string()
    .email({ message: '有効なメールアドレスを入力してください' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上必要です' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'パスワードには大文字、小文字、数字を含める必要があります',
    }),
});

export type SignUpForm = z.infer<typeof signUpFormSchema>;

export const verifyEmailFormSchema = z.object({
  email: z
    .string()
    .email({ message: '有効なメールアドレスを入力してください' }),
  code: z.string().min(6, { message: '6桁のコードを入力してください' }),
});

export type VerifyEmailForm = z.infer<typeof verifyEmailFormSchema>;

export const verifyEmailResponseSchema = z.union([
  z.object({
    error: z.string(),
  }),
  z.object({
    message: z.string(),
  }),
]);

export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
