import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import axios from "axios";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;
export const postSchema = z.object({
  id: z.string().uuid(),
  caption: z.string().min(1),
  imageKey: z.string().min(1),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const getPostResponseSchema = z.object({
  posts: z.array(postSchema),
});

export default function PostsScreen() {
  const colorScheme = useColorScheme();
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/posts`);
      const result = getPostResponseSchema.safeParse(response.data);
      if (result.error) {
        console.error(result.error);
        throw new Error(`error: ${result.error}`);
      }
      return result.data.posts;
    },
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>ポストが取得できませんでした</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ThemedView
            style={[
              styles.postContainer,
              {
                backgroundColor: colorScheme === "dark" ? "#353636" : "#D0D0D0",
              },
            ]}
          >
            <ThemedText style={styles.postTitle}>{item.caption}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 65,
    paddingBottom: 75,
  },
  postContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
