import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { User } from '@/constants/api';

type ProfileHeaderProps = {
  user: User;
  onLogout: () => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={{ uri: user.iconImageUrl }} style={styles.profileImage} />
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileBio}>{user.bio}</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    headerContainer: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    topRow: {
      flexDirection: 'row-reverse',
      paddingRight: 20,
      paddingTop: 8,
    },
    logoutText: {
      color: colors.tint,
      fontWeight: '600',
    },
    profileSection: {
      alignItems: 'center',
      marginTop: 8,
    },
    profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
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
