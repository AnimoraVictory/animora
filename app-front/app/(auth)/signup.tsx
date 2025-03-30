import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useSignUp } from "@/constants/api";
import { FormInput } from "@/components/FormInput";

const SignUpInputSchema = z.object({
  name: z.string(),
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" }),
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
  const theme = Colors[colorScheme ?? "light"];

  const { mutate: signUp, isPending } = useSignUp();

  const onSubmit = async (data: SignUpInput) => {
    try {
      await signUp(
        { email: data.email, password: data.password, name: data.name },
        {
          onSuccess: () => {
            Alert.alert("ユーザー登録が完了しました");
            router.push({
              pathname: "/(auth)/verify-email",
              params: { email: data.email },
            });
          },
          onError: (error: Error) => {
            Alert.alert(
              "サインアップエラー",
              error.message || "ユーザーの登録に失敗しました"
            );
          },
        }
      );
      // サインアップ成功後、verify-email 画面へ email をパラメータとして渡して遷移
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: data.email },
      });
    } catch (error: any) {
      Alert.alert(
        "サインアップエラー",
        error.message || "サインアップに失敗しました"
      );
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/noise2.png")}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>サインアップ</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Name"
                value={value}
                onChangeText={onChange}
                theme={theme}
                autoCapitalize="none"
                error={errors.name?.message}
              />
            )}
          />
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
                error={errors.password?.message}
              />
            )}
          />
          {isPending ? (
            <ActivityIndicator size="large" color={theme.tint} />
          ) : (
            <TouchableOpacity
              style={[styles.button, { borderColor: theme.tint }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, { color: theme.tint }]}>
                {isSubmitting ? "処理中..." : "サインアップ"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push("/")}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>戻る</Text>
          </TouchableOpacity>
        </View>
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
  input: {
    width: "100%",
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
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
  },
});
