import { useAuth } from '@/providers/AuthContext';
import { fetchApi } from '@/utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';
import { Pet } from './schema';

type Props = {
  pet: Pet;
};

export default function usePetPanel({ pet }: Props) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const handleDelete = useCallback(async () => {
    try {
      await fetchApi({
        method: 'DELETE',
        path: '/pets/delete',
        schema: z.void(),
        options: {
          params: { petId: pet.id },
        },
        token,
      });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '削除に失敗しました');
    }
  }, [pet.id, queryClient, token]);

  return { handleDelete };
}
