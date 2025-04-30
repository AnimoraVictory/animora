import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

const Setting: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* カスタムヘッダー */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/profile')}
        >
          <Icon name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerText}>設定</Text>
      </View>

      {/* アカウント設定への項目 */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/(setting)/account')}
      >
        <Text style={styles.menuItemText}>アカウント設定</Text>
        <Icon name="angle-right" size={20} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.middleBackground,
      paddingTop: 90,
      paddingHorizontal: 20,
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
      paddingLeft: 30,
      paddingTop: 60,
    },
    headerText: {
      paddingTop: 60,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.icon,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text,
    },
  });

export default Setting;
