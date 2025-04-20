import { useAuth } from '@/providers/AuthContext';
import { useRouter } from 'expo-router';
import { SignInForm, signInFormSchema } from './schema';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const useSignInScreen = () => {
  const router = useRouter();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)/posts');
    } catch (error: any) {
      Alert.alert('ログインエラー', error.message || 'ログインに失敗しました');
      console.error(error);
    }
  };

  return { onSubmit, control, handleSubmit, errors, isSubmitting };
};
