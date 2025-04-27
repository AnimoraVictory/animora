import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { UserResponse } from '@/features/user/schema/response';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaskedView from '@react-native-masked-view/masked-view';

type ProfileHeaderProps = {
  user: UserResponse;
  onLogout: () => void;
  onOpenFollowModal: () => void;
  setSelectedTab: (tab: 'follows' | 'followers') => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onLogout,
  onOpenFollowModal,
  setSelectedTab,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);
  const backgroundColor = colorScheme === 'light' ? 'white' : 'black';
  const handleOpenFollowModal = (tab: 'follows' | 'followers') => {
    setSelectedTab(tab);
    onOpenFollowModal();
  };
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 3000 }),
        withTiming(4, { duration: 200 }),
        withTiming(50, { duration: 360 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0.5, { duration: 3000 }),
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 360 })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const reflectionStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: '45deg' }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onLogout}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'ログアウト確認',
                '本当にログアウトしますか？',
                [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: 'はい', onPress: onLogout },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View style={styles.profileColumn}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={
              user.iconImageUrl
                ? { uri: user.iconImageUrl }
                : require('@/assets/images/profile.png')
            }
            style={styles.profileImage}
          />

          {user.streakCount > 0 && (
            <View style={styles.streakBadge}>
              <MaskedView
                style={{ width: 34, height: 34 }}
                maskElement={
                    <Icon
                      name="fire"
                      size={36}
                      color="black"
                      style={{ transform: [{ scaleX: 1.2 }] }}
                    />
                }
              >
                <Icon
                  name="fire"
                  size={40}
                  color="orange"
                  style={{ transform: [{ scaleX: 1.2 }] }}
                />
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    styles.reflection,
                    reflectionStyle,
                  ]}
                />
              </MaskedView>
              <Text style={styles.streakNumber}>{user.streakCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileBio}>{user.bio}</Text>

          <View style={styles.followContainer}>
            <TouchableOpacity
              style={styles.followBox}
              onPress={() => handleOpenFollowModal('follows')}
            >
              <Text style={styles.followCount}>{user.followsCount}</Text>
              <Text style={styles.followLabel}>フォロー</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.followBox}
              onPress={() => handleOpenFollowModal('followers')}
            >
              <Text style={styles.followCount}>{user.followersCount}</Text>
              <Text style={styles.followLabel}>フォロワー</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    profileColumn: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 8,
    },
    profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    statsContainer: {
      flex: 1,
      alignItems: 'center',
    },
    profileName: {
      fontSize: 20,
      paddingVertical: 8,
      fontWeight: 'bold',
      color: colors.text,
    },
    profileBio: {
      fontSize: 14,
      color: colors.icon,
      marginBottom: 8,
    },
    followContainer: {
      flexDirection: 'row',
    },
    followBox: {
      padding: 15,
    },
    followCount: {
      fontWeight: 'bold',
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    followLabel: {
      fontSize: 12,
      color: colors.icon,
      textAlign: 'center',
    },
    profileImageWrapper: {
      position: 'relative',
    },
    streakBadge: {
      position: 'absolute',
      top: -6,
      right: -10,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    streakNumber: {
      position: 'absolute',
      top: 8,
      left: 8,
      fontSize: 10,
      fontWeight: 'bold',
      color: 'white',
    },
    reflection: {
      position: 'absolute',
      top: -180,
      left: 0,
      width: 30,
      height: '100%',
      backgroundColor: 'white',
      opacity: 0,
    },
  });

export default ProfileHeader;
