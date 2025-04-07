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

export type Post = z.infer<typeof postSchema>;

type Props = {
  post: Post;
};

export const PostPanel = ({ post }: Props) => {

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
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

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Image source={{ uri: post.user.iconImageUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{post.user.name}</Text>
            <Text style={[styles.postTime, { color: colors.icon }]}>{formattedDateTime}</Text>
          </View>
        </View>
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image source={{ uri: post.imageUrl }} style={[styles.image, { height: imageHeight }]} />
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
  commentBox: {
    position: "absolute",
    bottom: 10,
    right: 10,
    alignItems: "center",
  },
});

export default PostPanel;
