import { View, Text, StyleSheet, Image, useColorScheme, Dimensions } from "react-native";
import { postSchema } from "@/app/(tabs)/posts";
import { z } from "zod";
import { Colors } from "@/constants/Colors";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";
import { FontAwesome } from "@expo/vector-icons";

export type Post = z.infer<typeof postSchema>;

const API_URL = Constants.expoConfig?.extra?.API_URL;

const userBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  iconImageUrl: z.string().url(),
});

const commentSchema = z.object({
  id: z.string(),
  user: userBaseSchema,
  content: z.string(),
  createdAt: z.string(),
});
type Comment = z.infer<typeof commentSchema>;

type Props = {
  post: Post;
};


export const PostPanel = ({ post }: Props) => {
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

  return (
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
        <View style={styles.commentBox}>
          <FontAwesome name="comments" size={30} color={colors.background} />
          <Text style={{color:colors.background}}>{post.commentsCount}</Text>
        </View>
      </View>
      <Text style={[styles.caption, { color: colors.tint }]}>{post.caption}</Text>
    </View>
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
