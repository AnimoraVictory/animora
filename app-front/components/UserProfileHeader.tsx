import React, { useEffect, useState } from 'react';
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
import MaskedView from '@react-native-masked-view/masked-view';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserProfileMenu from './UserProfileMenu';
import { UseMutationResult } from '@tanstack/react-query';

type UserProfileHeaderProps = {
  isMe: boolean;
  user: UserResponse;
  onPressFollow: () => void;
  onOpenFollowModal: () => void;
  setSelectedTab: (tab: 'follows' | 'followers') => void;
  isFollowing: boolean;
  isBlocked: boolean;
  isBlocking: boolean;
  blockMutation: UseMutationResult<void, Error, void>;
  unBlockMutation: UseMutationResult<void, Error, void>;
};

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  isMe,
  user,
  onPressFollow,
  onOpenFollowModal,
  setSelectedTab,
  isFollowing,
  isBlocked,
  isBlocking,
  blockMutation,
  unBlockMutation,
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuAnimation = useSharedValue(-300);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = colorScheme === 'light' ? 'white' : 'black';

  const handleOpenFollowModal = (tab: 'follows' | 'followers') => {
    setSelectedTab(tab);
    onOpenFollowModal();
  };

  const openMenu = () => {
    setIsMenuVisible(true);
    menuAnimation.value = withTiming(0, { duration: 300 });
  };

  const closeMenu = () => {
    menuAnimation.value = withTiming(-300, { duration: 300 }, () => {
      runOnJS(setIsMenuVisible)(false);
    });
  };

  const handleBlockButtonPress = async () => {
    if (isBlocking) {
      try {
        await unBlockMutation.mutateAsync();
        Alert.alert('ブロック解除しました');
      } catch (error) {
        console.error(error);
        Alert.alert('エラー', 'ブロック解除に失敗しました');
      }
    } else {
      // ブロックされていない場合はブロック
      try {
        await blockMutation.mutateAsync();
        Alert.alert('ユーザーをブロックしました');
      } catch (error) {
        console.error(error);
        Alert.alert('エラー', 'ブロックに失敗しました');
      }
    }

    closeMenu();
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
    <>
      <View style={[styles.headerContainer, { backgroundColor }]}>
        <Text style={[styles.profileName, { color: colors.tint }]}>
          {user.name}
        </Text>
        <Text style={[styles.profileBio, { color: colors.tint }]}>
          {user.bio}
        </Text>
        {!isMe && (
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <FontAwesome5 name="ellipsis-v" size={18} color={colors.tint} />
          </TouchableOpacity>
        )}

        <View style={styles.row}>
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

          <View style={styles.rightBox}>
            <View style={styles.followRow}>
              <TouchableOpacity
                style={styles.followBox}
                onPress={() => handleOpenFollowModal('follows')}
                disabled={isBlocked}
              >
                <Text style={[styles.followCount, { color: colors.tint }]}>
                  {user.followsCount}
                </Text>
                <Text style={[styles.followLabel, { color: colors.tint }]}>
                  フォロー
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.followBox}
                onPress={() => handleOpenFollowModal('followers')}
                disabled={isBlocked}
              >
                <Text style={[styles.followCount, { color: colors.tint }]}>
                  {user.followersCount}
                </Text>
                <Text style={[styles.followLabel, { color: colors.tint }]}>
                  フォロワー
                </Text>
              </TouchableOpacity>
              {!isMe && !isBlocked && !isBlocking && (
                <TouchableOpacity
                  style={[styles.followButton, { borderColor: colors.tint }]}
                  onPress={onPressFollow}
                >
                  <Text
                    style={[styles.followButtonText, { color: colors.tint }]}
                  >
                    {isFollowing ? 'フォロー解除' : 'フォローする'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      <UserProfileMenu
        visible={isMenuVisible}
        onClose={closeMenu}
        onReport={() => {
          Alert.alert('通報しました');
          closeMenu();
        }}
        onBlock={handleBlockButtonPress}
        isBlocking={isBlocking}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  rightBox: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  followRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  followBox: {
    marginRight: 16,
    alignItems: 'center',
  },
  followCount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  followLabel: {
    fontSize: 12,
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  streakBadge: {
    position: 'absolute',
    top: -6,
    left: 50,
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
  menuButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    marginRight: 10,
  },
});

export default UserProfileHeader;
