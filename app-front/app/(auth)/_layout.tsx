// app/_layout.tsx
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
  } from "@react-navigation/native";
  import { useFonts } from "expo-font";
  import { Slot, useRouter } from "expo-router";
  import * as SplashScreen from "expo-splash-screen";
  import { StatusBar } from "expo-status-bar";
  import { useEffect } from "react";
  import "react-native-reanimated";
  
  import { useColorScheme } from "@/hooks/useColorScheme";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/providers/AuthContext";
  
  // SplashScreen が自動で隠れないように設定
  SplashScreen.preventAutoHideAsync();
  
  const queryClient = new QueryClient();
  
  function AuthRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && user) {
        router.replace("/(tabs)");
      }
    }, [user, loading, router]);
  
    return null;
  }
  
  export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
      SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    });
  
    useEffect(() => {
      if (loaded) {
        SplashScreen.hideAsync();
      }
    }, [loaded]);
  
    if (!loaded) {
      return null;
    }
  
    return (
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <AuthRedirect />
            <Slot />
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    );
  }
  