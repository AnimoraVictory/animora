import { useAuth } from '@/providers/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { PetForm, petFormSchema } from './schema';
import { useCallback, useState } from 'react';
import { onChangeFunction } from '@/utils/form';
import { Alert } from 'react-native';
import { speciesMap } from '@/constants/petSpecies';
import { fetchApi } from '@/utils/api';
import { z } from 'zod';

const INITIAL_FORM_STATE: PetForm = {
  name: '',
  petType: 'dog',
  species: '',
  birthDay: '',
  iconImageUri: null,
};

type Props = {
  onClose: () => void;
  onCloseDatePicker: () => void;
  refetchPets: () => void;
};

export default function usePetRegisterModal({
  onClose,
  onCloseDatePicker,
  refetchPets,
}: Props) {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState<PetForm>(INITIAL_FORM_STATE);
  const onChangeForm = onChangeFunction(setFormData);

  const [date, setDate] = useState<Date | null>(null);

  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (event.type === 'set' && selectedDate) {
        // ユーザーが「決定」ボタンを押したときだけ閉じる
        setDate(selectedDate);
        const formatted = selectedDate.toISOString().split('T')[0];
        setFormData({ ...formData, birthDay: formatted });
      } else {
        onCloseDatePicker();
      }
    },
    [formData, onCloseDatePicker]
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return fetchApi({
        method: 'POST',
        path: '/pets/new',
        schema: z.void(),
        options: {
          data,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
        token,
      });
    },
  });

  const handleSubmit = useCallback(async () => {
    const backendSpecies = speciesMap[formData.petType][formData.species];
    const dataToValidate = { ...formData, species: backendSpecies };

    const result = petFormSchema.safeParse(dataToValidate);
    if (!result.success) {
      const errorMessage = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join('\n');
      Alert.alert('入力エラー', errorMessage);
      return;
    }

    // FormData の作成
    const fd = new FormData();
    if (!user?.id) {
      Alert.alert('エラー', 'ユーザー情報が取得できませんでした');
      return;
    }
    fd.append('name', formData.name);
    fd.append('type', formData.petType);
    fd.append('species', backendSpecies);
    fd.append('birthDay', formData.birthDay);
    fd.append('userId', user?.id);
    // アイコン画像が選択されている場合
    if (formData.iconImageUri) {
      const filename = formData.iconImageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const mimeType = match ? `image/${match[1]}` : 'image';
      fd.append('image', {
        uri: formData.iconImageUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    try {
      await mutateAsync(fd);
      Alert.alert('成功', 'ペットが正常に登録されました');
      refetchPets();
      setFormData(INITIAL_FORM_STATE);
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('登録エラー', 'ペットの登録に失敗しました');
    }
  }, [formData, mutateAsync, onClose, refetchPets, user?.id]);

  return {
    formData,
    onChangeForm,
    date,
    handleDateChange,
    handleSubmit,
    isPending,
  };
}
