import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import CommentsModal from '@/components/CommentsModal';
import UserProfileModal from './UserProfileModal';
import { useModalStack } from '@/providers/ModalStackContext';
import { TaskType, taskTypeMap } from '@/app/(tabs)/camera';
import { PostResponse } from '@/features/post/schema/response';
import usePostsScreen from '@/features/post/usePostsScreen';
import PostMenu from './PostMenu';
import ReportPostModal from './ReportPostModal';
import { useAuth } from '@/providers/AuthContext';

type Props = {
  post: PostResponse;
};

const SCLEEN_HEIGHT = Dimensions.get('window').height;

export const PostPanel = ({ post }: Props) => {
  const { push, pop } = useModalStack();
  const { user } = useAuth();

  const { likedByCurrentUser, handleToggleLike, isLoadingLike, handleLike } =
    usePostsScreen({ post });

  const [isReportVisible, setIsReportVisible] = useState<boolean>(false);
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState<boolean>(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const slideAnimUser = useRef(
    new Animated.Value(Dimensions.get('window').width)
  ).current;

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (post.dailyTask) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [glowAnim, post.dailyTask]);
  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = (screenWidth * 14) / 9;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const date = new Date(post.createdAt);
  const formattedDateTime = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const windowHeight = Dimensions.get('window').height;

  const OpenModal = () => {
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: windowHeight * 0.8,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  };

  const openUserProfile = () => {
    setIsUserModalVisible(true);
    push('1');
    Animated.timing(slideAnimUser, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeUserProfile = () => {
    Animated.timing(slideAnimUser, {
      toValue: Dimensions.get('window').width,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsUserModalVisible(false);
      pop();
    });
  };

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggleLikeButton = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    handleToggleLike();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDoubleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(handleLike);
  };
  const slideAnimMenu = useRef(new Animated.Value(SCLEEN_HEIGHT)).current;
  const slideAnimReport = useRef(new Animated.Value(300)).current;

  const handleOpenReportModal = () => {
    setIsMenuVisible(false);
    Animated.timing(slideAnimReport, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsReportVisible(true));
  };

  const handleOpenMenuModal = () => {
    setIsMenuVisible(true);
    Animated.timing(slideAnimMenu, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseMenuModal = () => {
    Animated.timing(slideAnimMenu, {
      toValue: SCLEEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsMenuVisible(false));
  };

  const handleCloseReportModal = () => {
    Animated.timing(slideAnimReport, {
      toValue: SCLEEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsReportVisible(false));
  };

  return (
    <>
      <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
        <View style={styles.wrapper}>
          {post.dailyTask && (
            <View style={styles.taskOverlay}>
              <Text style={styles.taskOverlayText}>
                🎯 {taskTypeMap[post.dailyTask.type as TaskType]}
              </Text>
            </View>
          )}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={openUserProfile}
              style={styles.userInfoWrapper}
            >
              <Image
                source={
                  post.user.iconImageUrl
                    ? { uri: post.user.iconImageUrl }
                    : require('@/assets/images/profile.png')
                }
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {post.user.name}
                </Text>
                <Text style={[styles.postTime, { color: colors.icon }]}>
                  {formattedDateTime}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleOpenMenuModal}>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[
              styles.imageGlowWrapper,
              post.dailyTask && {
                shadowOpacity: animatedShadowOpacity,
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 15,
                borderRadius: 20,
              },
            ]}
          >
            <Image
              source={{ uri: post.imageUrl }}
              style={[styles.image, { height: imageHeight }]}
            />

            <TouchableOpacity
              style={styles.likeBox}
              onPress={handleToggleLikeButton}
              disabled={isLoadingLike}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name="heart"
                  size={35}
                  color={likedByCurrentUser ? 'red' : 'white'}
                />
              </Animated.View>
              <Text style={{ color: 'white' }}>{post.likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commentBox}
              onPress={() => OpenModal()}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={35}
                color="white"
              />
              <Text style={{ color: 'white' }}>{post.commentsCount}</Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.caption, { color: colors.tint }]}>
            {post.caption}
          </Text>
        </View>
      </TapGestureHandler>
      <CommentsModal
        slideAnim={slideAnim}
        postId={post.id}
        visible={isModalVisible}
        comments={post.comments}
        onClose={closeModal}
        queryKey={['posts']}
        onNewComment={() => {}}
      />
      <UserProfileModal
        prevModalIdx={0}
        key={post.user.id}
        email={post.user.email}
        visible={isUserModalVisible}
        onClose={closeUserProfile}
        slideAnim={slideAnimUser}
      />
      <PostMenu
        visible={isMenuVisible}
        onClose={handleCloseMenuModal}
        onReport={handleOpenReportModal}
        slideAnim={slideAnimMenu}
      />
      <ReportPostModal
        visible={isReportVisible}
        onClose={handleCloseReportModal}
        postId={post.id}
        userId={user?.id ?? ''}
        slideAnim={slideAnimReport}
      />
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  taskOverlay: {
    position: 'absolute',
    top: 60,
    left: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    zIndex: 2,
  },

  taskOverlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  imageGlowWrapper: {
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  image: {
    borderRadius: 20,
    width: '100%',
  },
  caption: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginHorizontal: 8,
  },
  likeBox: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    alignItems: 'center',
  },
  commentBox: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    alignItems: 'center',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});

export default PostPanel;
