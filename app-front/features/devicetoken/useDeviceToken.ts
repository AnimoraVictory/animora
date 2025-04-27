import { Alert, Platform } from 'react-native';
import { fetchApi } from '@/utils/api';
import { useAuth } from '@/providers/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useCallback } from 'react';
import { z } from 'zod';

export default function useDeviceToken() {
  const { user, token } = useAuth();

  const upsertDeviceToken = useCallback(
    async (deviceId: string) => {
      if (!user) return;

      try {
        const notificationToken = await SecureStore.getItemAsync(
          'notificationToken'
        );
        if (!notificationToken) {
          Alert.alert('エラー', 'デバイストークンが取得できませんでした');
          return;
        }

        const platform = Platform.OS;

        await fetchApi({
          method: 'POST',
          path: `devicetokens/upsert?userId=${user.id}&deviceId=${deviceId}&token=${notificationToken}&platform=${platform}`,
          schema: z.any(),
          options: {},
          token,
        });
      } catch (error) {
        console.error(error);
        console.error('デバイストークンのアップサートに失敗しました', error);
      }
    },
    [user, token]
  );

  return { upsertDeviceToken };
}
