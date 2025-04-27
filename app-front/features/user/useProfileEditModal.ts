import { useEffect, useState } from 'react';
import { ProfileEditForm, profileEditSchema } from './schema';
import { onChangeFunction } from '@/utils/form';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import { z } from 'zod';
import { useAuth } from '@/providers/AuthContext';
import { UserResponse } from './schema/response';

const getInitialProfileState = (
  user: UserResponse | null | undefined
): ProfileEditForm => ({
  imageUri: user?.iconImageUrl || null,
  name: user?.name || '',
  bio: user?.bio || '',
});

type Props = {
  onClose: () => void;
};

export default function useProfileEditModal({ onClose }: Props) {
  const { token, user, refetch: refetchUser } = useAuth();
  const [formData, setFormData] = useState<ProfileEditForm>(
    getInitialProfileState(user)
  );
  const onChangeForm = onChangeFunction(setFormData);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return fetchApi({
        method: 'PUT',
        path: `users/update?id=${user?.id}`,
        schema: z.any(),
        options: {
          data,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
        token,
      });
    },
  });

  const handleSubmit = async () => {
    const parseResult = profileEditSchema.safeParse(formData);
    if (!parseResult.success) {
      const errorMessages = Object.values(
        parseResult.error.flatten().fieldErrors
      )
        .flat()
        .join('\n');
      Alert.alert('入力エラー', errorMessages);
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('bio', formData.bio);

    if (formData.imageUri && formData.imageUri !== user?.iconImageUrl) {
      const filename = formData.imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const mimeType = match ? `image/${match[1]}` : 'image';
      fd.append('image', {
        uri: formData.imageUri,
        name: filename,
        type: mimeType,
      } as any);
    }
    try {
      await mutateAsync(fd);
      Alert.alert('成功', 'プロフィールが更新されました');
      await refetchUser();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('更新エラー', 'プロフィール更新に失敗しました');
    }
  };

  useEffect(() => {
    setFormData(getInitialProfileState(user));
  }, [user]);

  return { formData, onChangeForm, handleSubmit, isPending };
}
