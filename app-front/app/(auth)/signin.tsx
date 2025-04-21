import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FormInput } from '@/components/FormInput';
import { useSignInScreen } from '@/features/auth/useSignInScreen';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const router = useRouter();

  const { onSubmit, control, handleSubmit, errors, isSubmitting } =
    useSignInScreen();

  return (
    <ImageBackground
      source={require('../../assets/images/noise2.png')}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>サインイン</Text>

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
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push('/signup')}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    alignSelf: 'flex-start',
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
    textAlign: 'center',
  },
});
