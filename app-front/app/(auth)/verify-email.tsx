import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { verifyEmail } from "@/constants/api";

const VerifyEmailInputSchema = z.object({
  email: z.string().email({ message: "無効なメールアドレス" }),
  code: z.string().min(1, { message: "確認コードを入力してください" }),
});

type VerifyEmailInput = z.infer<typeof VerifyEmailInputSchema>;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyEmailInput>({
    resolver: zodResolver(VerifyEmailInputSchema),
    defaultValues: { email: email || "", code: "" },
  });
  const colorScheme = useColorScheme();

  const onSubmit = async (data: VerifyEmailInput) => {
    try {
      await verifyEmail(data.email, data.code);
      Alert.alert("認証成功", "メール認証が完了しました");
      router.push("/(auth)/signin");
    } catch (error: any) {
      Alert.alert("認証エラー", error.message || "メール認証に失敗しました");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}>
        メール認証
      </Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={[styles.input, {color: Colors[colorScheme ?? "light"].text }]}
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
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={[styles.input, {color: Colors[colorScheme ?? "light"].text }]}
              placeholder="確認コード"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}
          </>
        )}
      />
      <Button
        title={isSubmitting ? "処理中..." : "認証する"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        color={Colors[colorScheme ?? "light"].tint}
      />
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
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
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});
