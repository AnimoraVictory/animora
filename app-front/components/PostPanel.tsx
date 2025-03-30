import { View, Text, StyleSheet, Image, useColorScheme, Dimensions } from "react-native";
import { postSchema } from "@/app/(tabs)/posts";
import { z } from "zod";
import { Colors } from "@/constants/Colors";

export type Post = z.infer<typeof postSchema>;

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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
      <Image source={{ uri: post.imageUrl }} style={[styles.image, { height: imageHeight }]} />
      <Text style={[styles.caption, { color: colors.tint }]}>{post.caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    paddingHorizontal: 20
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
});
