import { fetchApi } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { z } from 'zod';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/providers/AuthContext';

const ACCESS_TOKEN_KEY = 'accessToken';
const ID_TOKEN_KEY = 'idToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export default function useAccountSetting() {
  const { user, token } = useAuth();
  const deleteUserMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('ユーザー情報が見つかりません');
      return fetchApi({
        method: 'DELETE',
        path: `auth/delete?id=${user?.id}`,
        schema: z.any(),
        token,
        options: {},
      });
    },
    onSuccess: async () => {
      Alert.alert('アカウントを削除しました');
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    },
    onError: () => {
      Alert.alert('アカウントの削除に失敗しました');
    },
  });

  return { deleteUserMutation };
}
