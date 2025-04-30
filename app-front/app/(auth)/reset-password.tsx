import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useResetPassword } from '@/features/auth/useResetPassword';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FormInput } from '@/components/FormInput';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();
  const { confirmResetPasswordMutation } = useResetPassword();

  const handleConfirm = async () => {
    try {
      await confirmResetPasswordMutation.mutateAsync({
        email,
        code,
        newPassword,
      });
      Alert.alert('パスワードを再設定しました');
      router.replace('/signin');
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '再設定に失敗しました');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/noise2.png')}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            パスワード再設定
          </Text>

          <FormInput
            label="確認コード"
            value={code}
            onChangeText={setCode}
            theme={theme}
            keyboardType="default"
          />

          <FormInput
            label="新しいパスワード"
            value={newPassword}
            onChangeText={setNewPassword}
            theme={theme}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={handleConfirm}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              パスワードを再設定
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
