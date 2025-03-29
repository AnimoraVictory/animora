import React, { useState, useRef } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/providers/AuthContext";
import { FormInput } from "@/components/FormInput";

const SignInInputSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" }),
  password: z.string().min(1, { message: "パスワードを入力してください" }),
});

type SignInInput = z.infer<typeof SignInInputSchema>;

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { login } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInInputSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      await login(data.email, data.password);
      router.replace("/(tabs)/posts");
    } catch (error: any) {
      Alert.alert("ログインエラー", error.message || "ログインに失敗しました");
    }
  };

  const getLabelStyle = (animRef: Animated.Value) => ({
    position: "absolute" as const,
    left: 12,
    top: animRef.interpolate({ inputRange: [0, 1], outputRange: [10, -10] }),
    fontSize: animRef.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animRef.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#2ecc71"],
    }),
    backgroundColor: theme.background,
    paddingHorizontal: 4,
    zIndex: 1,
  });

  const handleFocus = (
    setFocused: React.Dispatch<React.SetStateAction<boolean>>,
    animRef: Animated.Value
  ) => {
    setFocused(true);
    Animated.timing(animRef, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (
    setFocused: React.Dispatch<React.SetStateAction<boolean>>,
    animRef: Animated.Value,
    value: string
  ) => {
    if (!value) {
      Animated.timing(animRef, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start(() => setFocused(false));
    } else {
      setFocused(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/noise2.png")}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>サインイン</Text>

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Email"
                value={value}
                onChangeText={onChange}
                theme={theme}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Password"
                value={value}
                onChangeText={onChange}
                theme={theme}
                secureTextEntry
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <TouchableOpacity
            style={[styles.button, { borderColor: theme.tint }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, { color: theme.tint }]}>
              ログイン
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { borderColor: theme.tint }]}
            onPress={() => router.push("/signup")}
          >
            <Text style={[styles.buttonText, { color: theme.tint }]}>
              ユーザー登録がまだの方はこちら
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  button: {
    width: "60%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
