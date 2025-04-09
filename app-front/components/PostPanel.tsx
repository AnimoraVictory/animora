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
import { Ionicons, } from "@expo/vector-icons";
import CommentsModal from "@/components/CommentsModal";
import { useAuth } from "@/providers/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import axios from "axios";
import UserProfileModal from "./UserProfileModal";

export type Post = z.infer<typeof postSchema>;

type Props = {
  post: Post;
};

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const PostPanel = ({ post }: Props) => {

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = React.useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const slideAnimUser = useRef(new Animated.Value(Dimensions.get("window").width)).current;
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
        return axios.post(`${API_URL}/likes/new?userId=${userId}&postId=${postId}`);
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
        return axios.delete(`${API_URL}/likes/delete?userId=${userId}&postId=${postId}`);
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
    }).start(() => setIsUserModalVisible(false));
  };

  return (
    <>
      <View style={styles.wrapper}>
        <TouchableOpacity style={styles.header} onPress={openUserProfile}>
          <Image source={{ uri: post.user.iconImageUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{post.user.name}</Text>
            <Text style={[styles.postTime, { color: colors.icon }]}>{formattedDateTime}</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image source={{ uri: post.imageUrl }} style={[styles.image, { height: imageHeight }]} />

          <TouchableOpacity
            style={styles.likeBox}
            onPress={() => toggleLike(likedByCurrentUser)}
          >
            <Ionicons name="heart" size={35} color={likedByCurrentUser ? "red" : "white"} />
            <Text style={{ color: "white" }}>{post.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentBox} onPress={() => OpenModal()}>

            <Ionicons name="chatbox-ellipses-outline" size={35} color="white" />
            <Text style={{ color: "white" }}>{post.commentsCount}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.caption, { color: colors.tint }]}>{post.caption}</Text>
      </View>
      <CommentsModal
        slideAnim={slideAnim}
        postId={post.id}
        currentUser={currentUser}
        visible={isModalVisible}
        comments={post.comments}
        onClose={closeModal}
      />
      <UserProfileModal
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
