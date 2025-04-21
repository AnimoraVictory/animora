import { useAuth } from '@/providers/AuthContext';
import { fetchApi } from '@/utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';
import { CreatePostForm, createPostFormSchema } from './schema';
import { onChangeFunction } from '@/utils/form';

type Props = {
  photoUri: string;
  onClose: () => void;
  dailyTaskId: string | undefined;
};

export const useCreatePostModal = ({
  photoUri,
  onClose,
  dailyTaskId,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token } = useAuth();

  const initialFormState = {
    imageUri: photoUri,
    caption: '',
    userId: user?.id ?? '',
    dailyTaskId: dailyTaskId ?? undefined,
  };
  const [formData, setFormData] = useState<CreatePostForm>(initialFormState);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return fetchApi({
        method: 'POST',
        path: 'posts',
        schema: z.any(),
        options: {
          data,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
        token,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      Alert.alert('投稿完了', '投稿が完了しました！');
      onClose();
      router.replace('/(tabs)/posts');
    },
    onError: (error) => {
      console.error(`error: ${error}`);
      Alert.alert('エラー', '投稿に失敗しました。');
    },
  });

  const handleSubmit = useCallback(async () => {
    const result = createPostFormSchema.safeParse(formData);
    if (!result.success) {
      const errorMessage = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join('\n');
      Alert.alert('フォームエラー', errorMessage);
      return;
    }

    const fd = new FormData();
    fd.append('image', {
      uri: formData.imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);
    fd.append('caption', formData.caption);
    fd.append('userId', formData.userId);
    if (formData.dailyTaskId) {
      fd.append('dailyTaskId', formData.dailyTaskId);
    }

    mutate(fd);
  }, [formData, mutate]);

  const onChangeFormData = onChangeFunction(setFormData);

  return {
    formData,
    onChangeFormData,
    handleSubmit,
    isPending,
  };
};
