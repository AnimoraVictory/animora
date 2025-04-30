import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import useAccountSetting from '@/features/user/useAccountSetting';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

const Account: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);
  const router = useRouter();

  const { deleteUserMutation } = useAccountSetting();

  const handleDelete = () => {
    Alert.alert('確認', 'アカウントを本当に削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUserMutation.mutateAsync();
            router.replace('/');
          } catch (err) {
            console.error(err);
            Alert.alert('エラー', 'アカウントの削除に失敗しました');
          }
        },
      },
    ]);
  };

  return (
    <>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerText}>アカウント</Text>
      </View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>アカウントを削除する</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.middleBackground,
      padding: 20,
    },
    topHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 90,
      zIndex: 10,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    backButton: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10,
      paddingTop: 60,
      paddingLeft: 20,
    },
    headerText: {
      paddingTop: 60,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    deleteButton: {
      marginTop: 90,
      backgroundColor: 'red',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

export default Account;

export const options = {
  title: 'アカウント',
};
