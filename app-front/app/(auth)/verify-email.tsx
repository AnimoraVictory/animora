import React from 'react';
import {
  Text,
  Button,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FormInput } from '@/components/FormInput';
import { VerifyEmailForm, verifyEmailFormSchema } from '@/features/auth/schema';
import { useVerifyEmailScreen } from '@/features/auth/useVerifyEmailScreen';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailForm>({
    resolver: zodResolver(verifyEmailFormSchema),
    defaultValues: { email: email || '', code: '' },
  });
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const colors = Colors[colorScheme ?? 'light'];

  const { onSubmit } = useVerifyEmailScreen();

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ImageBackground
        source={require('../../assets/images/noise2.png')}
        resizeMode="repeat"
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>メール認証</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Email"
              value={value}
              onChangeText={onChange}
              theme={theme}
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Code"
              value={value}
              onChangeText={onChange}
              theme={theme}
              autoCapitalize="none"
              error={errors.code?.message}
            />
          )}
        />
        <Button
          title={isSubmitting ? '処理中...' : '認証する'}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          color={Colors[colorScheme ?? 'light'].tint}
        />
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
