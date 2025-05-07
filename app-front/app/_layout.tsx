import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/providers/AuthContext';
import { Colors } from '@/constants/Colors';
import Constants from 'expo-constants';
import { HomeTabScrollProvider } from '@/providers/HomeTabScrollContext';
import { ModalStackProvider } from '@/providers/ModalStackContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as ScreenOrientation from 'expo-screen-orientation';

// SplashScreen が自動で隠れないように設定
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
export const API_URL = Constants.expoConfig?.extra?.API_URL;

// ログインしてたら、作成したトークンをバックエンドに送る、してなかったら、ローカルのストレージに保存

async function saveDeviceTokenToStorage() {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId: '9620deb2-9d31-4c2b-ac91-d41231661941',
    });

    if (expoPushToken) {
      console.log('expoPushToken', expoPushToken);
      await SecureStore.setItemAsync('notificationToken', expoPushToken);
    }
  } catch (error) {
    console.error('トークン取得中にエラー発生:', error);
  }
}

// ユーザーの有無に応じてリダイレクトする
function AuthSwitch() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (pathname.startsWith('/profile')) {
          return;
        }
        router.replace('/(tabs)/posts');
      } else {
        router.replace('/(auth)');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? 'light'].tint}
        />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    saveDeviceTokenToStorage();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? 'light'].tint}
        />
      </View>
    );
  }

  // QueryClientProvider を最上位に配置し、その中に AuthProvider を配置する
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <HomeTabScrollProvider>
            <ModalStackProvider>
              <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
              >
                <AuthSwitch />
                <StatusBar style="auto" />
              </ThemeProvider>
            </ModalStackProvider>
          </HomeTabScrollProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
