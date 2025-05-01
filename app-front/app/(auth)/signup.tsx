import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FormInput } from '@/components/FormInput';
import { useSignUpScreen } from '@/features/auth/useSignUpScreen';
import { SignUpForm, signUpFormSchema } from '@/features/auth/schema';
import { CheckButton } from '@/components/CheckButton';

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
  const [isChecked, setIsChecked] = useState(false);

  const { onSubmit, isPending } = useSignUpScreen();

  const progress = useRef(new Animated.Value(0)).current;

  const handleToggleCheck = () => {
    setIsChecked(!isChecked);
    Animated.timing(progress, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

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
            <Text style={{ textAlign: 'center', color: theme.text }}>
              ユーザーを登録するには
              <Text
                style={{ textDecorationLine: 'underline', color: theme.tint }}
                onPress={() =>
                  Linking.openURL(
                    'https://www.notion.so/Animora-Terms-of-Service-1e636c984ce08092b564f0bfb49f8ee5?pvs=4'
                  )
                }
              >
                利用規約
              </Text>
              と
              <Text
                style={{ textDecorationLine: 'underline', color: theme.tint }}
                onPress={() =>
                  Linking.openURL(
                    'https://www.notion.so/Animora-1e636c984ce080868d20c98347323fbb?pvs=4'
                  )
                }
              >
                プライバシーポリシー
              </Text>
              に同意する必要があります
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <View style={styles.checkboxContainer}>
                <CheckButton
                  checked={isChecked}
                  onToggle={handleToggleCheck}
                  testID="check-agree"
                  testOnlyChecked={process.env.NODE_ENV === 'test'}
                />
                <Text style={{ marginLeft: 8, color: theme.text }}>
                  利用規約及びプライバシーポリシーに同意します
                </Text>
              </View>
            </View>

            {isPending ? (
              <ActivityIndicator size="large" color={theme.tint} />
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderColor: theme.tint,
                    opacity: isSubmitting || !isChecked ? 0.5 : 1, // ← 透明度で制御
                  },
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isChecked}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spinner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'green',
  },
  checkIcon: {
    zIndex: 1,
  },
});
