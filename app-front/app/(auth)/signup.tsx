// TODO: サインアップの動作確認をする。
import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { signUp } from "@/constants/api";

const SignUpInputSchema = z.object({
  name: z.string(),
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上必要です" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: "パスワードには大文字、小文字、数字を含める必要があります",
    }),
});

type SignUpInput = z.infer<typeof SignUpInputSchema>;

export default function SignUpScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpInputSchema),
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();
  const colorScheme = useColorScheme();

  const onSubmit = async (data: SignUpInput) => {
    try {
      await signUp(data.email, data.password, data.name);
      // サインアップ成功後、verify-email 画面へ email をパラメータとして渡して遷移
      router.push({ pathname: "/(auth)/verify-email", params: { email: data.email } });
    } catch (error: any) {
      Alert.alert("サインアップエラー", error.message || "サインアップに失敗しました");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}>
        サインアップ
      </Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="UserName"
              autoCapitalize="none"
              keyboardType="default"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
          </>
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
          </>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </>
        )}
      />
      <Button
        title={isSubmitting ? "処理中..." : "サインアップ"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        color={Colors[colorScheme ?? "light"].tint}
      />
      <Button
        title="戻る"
        onPress={() => router.push("/")}
        color={Colors[colorScheme ?? "light"].tint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});
