import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FormInput } from '@/components/FormInput';
import { useSignUpScreen } from '@/features/auth/useSignUpScreen';
import { SignUpForm, signUpFormSchema } from '@/features/auth/schema';

export default function SignUpScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { email: '', password: '' },
  });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const { onSubmit, isPending } = useSignUpScreen();

  return (
    <ImageBackground
      source={require('../../assets/images/noise2.png')}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              サインアップ
            </Text>
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
                  {isSubmitting ? '処理中...' : 'サインアップ'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={() => router.push('/')}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                戻る
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    width: '60%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
