import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { User } from '@/constants/api';

type ProfileHeaderProps = {
  user: User
  onLogout: () => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
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
          source={{ uri: user.iconImageUrl }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileBio}>{user.bio}</Text>
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
      borderColor: colors.icon,
      paddingTop: 60,
      paddingBottom: 0,
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
