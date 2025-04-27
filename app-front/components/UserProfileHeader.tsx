import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { UserResponse } from '@/features/user/schema/response';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';

type UserProfileHeaderProps = {
  isMe: boolean;
  user: UserResponse;
  onPressFollow: () => void;
  onOpenFollowModal: () => void;
  setSelectedTab: (tab: 'follows' | 'followers') => void;
  isFollowing: boolean;
};

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  isMe,
  user,
  onPressFollow,
  onOpenFollowModal,
  setSelectedTab,
  isFollowing,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      <Text style={[styles.profileName, { color: colors.tint }]}>
        {user.name}
      </Text>
      <Text style={[styles.profileBio, { color: colors.tint }]}>
        {user.bio}
      </Text>

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
            >
              <Text style={[styles.followCount, { color: colors.tint }]}>
                {user.followersCount}
              </Text>
              <Text style={[styles.followLabel, { color: colors.tint }]}>
                フォロワー
              </Text>
            </TouchableOpacity>
            {!isMe && (
              <TouchableOpacity
                style={[styles.followButton, { borderColor: colors.tint }]}
                onPress={onPressFollow}
              >
                <Text style={[styles.followButtonText, { color: colors.tint }]}>
                  {isFollowing ? 'フォロー解除' : 'フォローする'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
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
});

export default UserProfileHeader;
