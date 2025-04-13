import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { postSchema } from "@/app/(tabs)/posts";
import { z } from "zod";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import CommentsModal from "@/components/CommentsModal";
import { useAuth } from "@/providers/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import axios from "axios";
import UserProfileModal from "./UserProfileModal";
import { useModalStack } from "@/providers/ModalStackContext";
import { TaskType, taskTypeMap } from "@/app/(tabs)/camera";

export type Post = z.infer<typeof postSchema>;

type Props = {
  post: Post;
};

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const PostPanel = ({ post }: Props) => {
  const { push, pop } = useModalStack();

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = React.useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const slideAnimUser = useRef(
    new Animated.Value(Dimensions.get("window").width)
  ).current;

  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
  }, [post.dailyTask]);
  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const screenWidth = Dimensions.get("window").width;
  const imageHeight = (screenWidth * 14) / 9;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const date = new Date(post.createdAt);
  const formattedDateTime = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { user: currentUser } = useAuth();

  const windowHeight = Dimensions.get("window").height;

  const likedByCurrentUser =
    post.likes?.some((like) => like.user.id === currentUser?.id) ?? false;

  const useToggleLike = (postId: string, userId: string) => {
    const queryClient = useQueryClient();

    const createLikeMutation = useMutation({
      mutationFn: () => {
        return axios.post(
          `${API_URL}/likes/new?userId=${userId}&postId=${postId}`
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: (error) => {
        console.error("likeに失敗しました", error);
      },
    });

    const deleteLikeMutation = useMutation({
      mutationFn: () => {
        return axios.delete(
          `${API_URL}/likes/delete?userId=${userId}&postId=${postId}`
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: (error) => {
        console.error("Like削除エラー", error);
      },
    });

    const toggleLike = (liked: boolean) => {
      if (liked) {
        deleteLikeMutation.mutate();
      } else {
        createLikeMutation.mutate();
      }
    };

    return { toggleLike };
  };

  const { toggleLike } = useToggleLike(post.id, currentUser?.id ?? "");

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
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const openUserProfile = () => {
    setIsUserModalVisible(true);
    push("1");
    Animated.timing(slideAnimUser, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeUserProfile = () => {
    Animated.timing(slideAnimUser, {
      toValue: Dimensions.get("window").width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsUserModalVisible(false);
      pop();
    });
  };

  return (
    <>
      <View style={styles.wrapper}>
        {post.dailyTask && (
          <View style={styles.taskOverlay}>
            <Text style={styles.taskOverlayText}>
              🎯 {taskTypeMap[post.dailyTask.type as TaskType]}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.header} onPress={openUserProfile}>
          <Image
            source={{ uri: post.user.iconImageUrl }}
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
        <Animated.View
          style={[
            styles.imageGlowWrapper,
            post.dailyTask && {
              shadowOpacity: animatedShadowOpacity,
              shadowColor: "#FFD700",
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
            onPress={() => toggleLike(likedByCurrentUser)}
          >
            <Ionicons
              name="heart"
              size={35}
              color={likedByCurrentUser ? "red" : "white"}
            />
            <Text style={{ color: "white" }}>{post.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commentBox}
            onPress={() => OpenModal()}
          >
            <Ionicons name="chatbox-ellipses-outline" size={35} color="white" />
            <Text style={{ color: "white" }}>{post.commentsCount}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={[styles.caption, { color: colors.tint }]}>
          {post.caption}
        </Text>
      </View>
      <CommentsModal
        slideAnim={slideAnim}
        postId={post.id}
        currentUser={currentUser}
        visible={isModalVisible}
        comments={post.comments}
        onClose={closeModal}
        queryKey={["posts"]}
        onNewComment={() => {}}
      />
      <UserProfileModal
        prevModalIdx={0}
        key={post.user.id}
        currentUser={{
          id: currentUser?.id ?? "",
          iconImageUrl: currentUser?.iconImageUrl ?? "",
          bio: currentUser?.bio ?? "",
          name: currentUser?.name ?? "",
          email: currentUser?.email ?? "",
        }}
        email={post.user.email}
        visible={isUserModalVisible}
        onClose={closeUserProfile}
        slideAnim={slideAnimUser}
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
    position: "absolute",
    top: 60,
    left: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    zIndex: 2,
  },
  
  taskOverlayText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
  },
  postTime: {
    fontSize: 12,
  },
  imageContainer: {
    position: "relative",
  },
  imageGlowWrapper: {
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  image: {
    borderRadius: 20,
    width: "100%",
  },
  caption: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
    marginHorizontal: 8,
  },
  likeBox: {
    position: "absolute",
    bottom: 80,
    right: 10,
    alignItems: "center",
  },
  commentBox: {
    position: "absolute",
    bottom: 20,
    right: 10,
    alignItems: "center",
  },
});

export default PostPanel;
