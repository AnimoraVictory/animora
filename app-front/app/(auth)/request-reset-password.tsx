import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FormInput } from '@/components/FormInput';
import { useResetPassword } from '@/features/auth/useResetPassword';

export default function RequestResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { requestResetPasswordMutation } = useResetPassword();

  const handleRequest = async () => {
    try {
      await requestResetPasswordMutation.mutateAsync(email);
      Alert.alert('確認コードを送信しました');
      router.push({ pathname: '/reset-password', params: { email } });
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '送信に失敗しました');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/noise2.png')}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            パスワード再設定
          </Text>

          <FormInput
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            theme={theme}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, { borderColor: theme.tint }]}
            onPress={handleRequest}
          >
            <Text style={[styles.buttonText, { color: theme.tint }]}>
              確認コードを送信
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
