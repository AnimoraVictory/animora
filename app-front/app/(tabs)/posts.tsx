import { useRef, useState } from "react";
import { useNavigation } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  Animated,
  ActivityIndicator,
  useColorScheme,
  Image,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { PostPanel } from "@/components/PostPanel";
import { Colors } from "@/constants/Colors";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bio: z.string(),
  iconImageUrl: z.string().url(),
});

export const postSchema = z.object({
  id: z.string().uuid(),
  caption: z.string().min(0),
  imageUrl: z.string().min(1),
  user: userSchema,
  createdAt: z.string().datetime(),
});

export const getPostResponseSchema = z.object({
  posts: z.array(postSchema),
});

export default function PostsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_HEIGHT = 80;

  const icon =
    colorScheme === "light"
      ? require("../../assets/images/icon-green.png")
      : require("../../assets/images/icon-dark.png");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/posts/`);
      const result = getPostResponseSchema.safeParse(response.data);
      if (result.error) {
        console.error(result.error);
        throw new Error(`error: ${result.error}`);
      }
      return result.data.posts;
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
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
        <Animated.FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={
            <ThemedText style={styles.errorText}>
              ポストが取得できませんでした
            </ThemedText>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              progressViewOffset={HEADER_HEIGHT}
              tintColor={colorScheme === "light" ? "black" : "white"}
            />
          }
          contentInset={{ top: HEADER_HEIGHT }}
          contentOffset={{ x: 0, y: -HEADER_HEIGHT }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
      >
        <Image source={icon} style={styles.logo} />
      </Animated.View>

      <Animated.FlatList
  style={{
    backgroundColor: colorScheme === "light" ? "white" : "black",
  }}
  contentInset={{ top: HEADER_HEIGHT + 12 }}
  contentOffset={{ x: 0, y: -(HEADER_HEIGHT + 12) }}
  contentContainerStyle={{ paddingBottom: 75 }}
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <PostPanel post={item} />}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colorScheme === "light" ? "black" : "white"}
    />
  }
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  )}
  scrollEventThrottle={16}
/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginTop: 40,
    resizeMode: "contain",
  },
  errorText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    color: "gray",
  },
});
