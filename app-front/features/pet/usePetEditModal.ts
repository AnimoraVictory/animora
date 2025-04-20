import { useAuth } from '@/providers/AuthContext';
import { fetchApi } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pet, PetForm, petFormSchema } from './schema';
import { reverseSpeciesMap, speciesMap } from '@/constants/petSpecies';
import { z } from 'zod';
import { Alert } from 'react-native';
import { onChangeFunction } from '@/utils/form';

const getInitialFormState = (pet: Pet): PetForm => ({
  name: pet.name || '',
  petType: pet.type || 'dog',
  species: reverseSpeciesMap[pet.type][pet.species] || '',
  birthDay: pet.birthDay || '',
  iconImageUri: pet.imageUrl || null,
});

type Props = {
  pet: Pet;
  onClose: () => void;
  onCloseDatePicker: () => void;
};

export default function usePetEditModal({
  pet,
  onClose,
  onCloseDatePicker,
}: Props) {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState<PetForm>(getInitialFormState(pet));
  const onChangeForm = onChangeFunction(setFormData);

  const [date, setDate] = useState<Date | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return fetchApi({
        method: 'PUT',
        path: `pets/update?petId=${pet.id}`,
        options: {
          data,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
        schema: z.void(),
        token: token,
      });
    },
  });

  const handleSubmit = async () => {
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
    // 編集対象のペットIDを送信するためのフィールド（例: petId）
    fd.append('petId', pet.id);
    fd.append('name', formData.name);
    fd.append('type', formData.petType);
    fd.append('species', backendSpecies);
    fd.append('birthDay', formData.birthDay);
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
      Alert.alert('成功', 'ペット情報が更新されました');
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('更新エラー', 'ペット情報の更新に失敗しました');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      // ユーザーが「決定」ボタンを押したときだけ閉じる
      setDate(selectedDate);
      const formatted = selectedDate.toISOString().split('T')[0];
      onChangeForm({ key: 'birthDay', value: formatted });
    } else {
      onCloseDatePicker();
    }
  };

  useEffect(() => {
    setFormData(getInitialFormState(pet));
  }, [pet]);

  return {
    isPending,
    formData,
    onChangeForm,
    date,
    handleDateChange,
    handleSubmit,
  };
}
