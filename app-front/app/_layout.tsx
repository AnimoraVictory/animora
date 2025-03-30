import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/providers/AuthContext";
import { Colors } from "@/constants/Colors";
import Constants from "expo-constants";

// SplashScreen が自動で隠れないように設定
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
export const API_URL = Constants.expoConfig?.extra?.API_URL;

// ユーザーの有無に応じてリダイレクトする
function AuthSwitch() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (pathname === "/(tabs)/profile") {
          router.replace("/(tabs)/profile");
        } else {
          router.replace("/(tabs)/posts");
        }
      } else {
        router.replace("/(auth)");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
        />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

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
          color={Colors[colorScheme ?? "light"].tint}
        />
      </View>
    );
  }

  // QueryClientProvider を最上位に配置し、その中に AuthProvider を配置する
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AuthSwitch />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
