import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import { SignUpForm } from './schema';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';

export const useSignUpScreen = () => {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SignUpForm) =>
      await fetchApi({
        method: 'POST',
        path: 'auth/signup',
        schema: z.any(),
        options: {
          data: data,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        token: null,
      }),
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      mutate(
        { email: data.email, password: data.password, name: data.name },
        {
          onSuccess: () => {
            Alert.alert('ユーザー登録が完了しました');
            router.push({
              pathname: '/(auth)/verify-email',
              params: { email: data.email },
            });
          },
          onError: (error: Error) => {
            Alert.alert(
              'サインアップエラー',
              error.message || 'ユーザーの登録に失敗しました'
            );
          },
        }
      );
    } catch (err) {
      Alert.alert(
        'サインアップエラー',
        (err as Error).message || 'サインアップに失敗しました'
      );
    }
  };

  return { onSubmit, isPending };
};
