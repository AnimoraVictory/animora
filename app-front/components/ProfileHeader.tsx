import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type ProfileHeaderProps = {
  userName: string;
  onLogout: () => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userName, onLogout }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <Text style={{ color: colors.tint }}>ログアウト</Text>
      </TouchableOpacity>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://example.com/profile.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profileBio}>ここに自己紹介文を記載</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: colors.background,
    },
    logoutButton: {
      position: 'absolute', 
      top: 50, 
      right: 20,
      zIndex: 100 ,
    },
    profileSection: {
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: colors.icon,
      paddingVertical: 20,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    profileName: {
      marginTop: 10,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    profileBio: {
      marginTop: 5,
      fontSize: 14,
      color: colors.icon,
    },
  });
