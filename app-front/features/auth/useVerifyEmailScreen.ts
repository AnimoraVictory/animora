import { useMutation } from '@tanstack/react-query';
import { verifyEmailFormSchema, VerifyEmailForm } from './schema';
import { z } from 'zod';
import { fetchApi } from '@/utils/api';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

export const useVerifyEmailScreen = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation<void, Error, VerifyEmailForm>({
    mutationFn: (data: VerifyEmailForm) => {
      const parsedData = verifyEmailFormSchema.parse(data);
      return fetchApi({
        method: 'POST',
        path: 'auth/verify-email',
        schema: z.void(),
        options: {
          data: parsedData,
        },
        token: null,
      });
    },
  });

  const onSubmit = (data: VerifyEmailForm) => {
    mutate(data, {
      onSuccess: () => {
        Alert.alert('認証成功', 'メール認証が完了しました');
        router.push('/(auth)/signin');
      },
      onError: (error: Error) => {
        Alert.alert('認証エラー', error.message || 'メール認証に失敗しました');
      },
    });
  };

  return { onSubmit, isPending };
};
