import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Animated,
  ActivityIndicator,
  useColorScheme,
  Image,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
} from "react-native";
import axios from "axios";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Post, PostPanel } from "@/components/PostPanel";
import { Colors } from "@/constants/Colors";
import { useHomeTabHandler } from "@/providers/HomeTabScrollContext";
import { petSchema } from "@/components/PetPanel";
import { useAuth } from "@/providers/AuthContext";
import DailyTaskPopUp from "@/components/DailyTaskPopUp";
import * as Haptics from "expo-haptics";

const API_URL = Constants.expoConfig?.extra?.API_URL;
export const postBaseSchema = z.object({
  id: z.string().uuid(),
});

export const userBaseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  bio: z.string(),
  iconImageUrl: z.string().nullable(),
});

export const dailyTaskBaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  type: z.string(),
});

export const dailyTaskSchema = dailyTaskBaseSchema.extend({
  post: postBaseSchema,
});

export const commentSchema = z.object({
  id: z.string(),
  user: userBaseSchema,
  content: z.string(),
  createdAt: z.string().datetime(),
});

export const likeSchema = z.object({
  id: z.string(),
  user: userBaseSchema,
  createdAt: z.string().datetime(),
});

export const postSchema = z.object({
  id: z.string().uuid(),
  caption: z.string().min(0),
  imageUrl: z.string().min(1),
  user: userBaseSchema,
  comments: z.array(commentSchema),
  commentsCount: z.number(),
  likes: z.array(likeSchema),
  likesCount: z.number(),
  createdAt: z.string().datetime(),
  dailyTask: dailyTaskBaseSchema.optional().nullable(),
});

export const userSchema = userBaseSchema.extend({
  followers: z.array(userBaseSchema),
  follows: z.array(userBaseSchema),
  followersCount: z.number(),
  followsCount: z.number(),
  posts: z.array(postSchema),
  pets: z.array(petSchema),
  dailyTask: dailyTaskSchema,
});

export const getPostResponseSchema = z.object({
  posts: z.array(postSchema),
  next_cursor: z.string().nullable(),
});

export default function PostsScreen() {
  const colorScheme = useColorScheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYRef = useRef(0);
  const listRef = useRef<FlatList>(null);
  const HEADER_HEIGHT = 90;
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { user: currentUser } = useAuth();


  const { isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["posts", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await axios.post(`${API_URL}/timeline`, {
        user_id: currentUser.id,
        limit: 10,
      });
      const result = getPostResponseSchema.safeParse(response.data);
      if (!result.success) throw new Error("Failed to parse");
      setPosts(result.data.posts);
      setCursor(result.data.next_cursor ?? undefined);
      return result.data.posts;
    },
    enabled: !!currentUser?.id,
  });

  const icon =
    colorScheme === "light"
      ? require("../../assets/images/icon-green.png")
      : require("../../assets/images/icon-dark.png");

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  const { setHandler } = useHomeTabHandler();
  const isDailyTaskDone = currentUser?.dailyTask.post ? true : false;

  useEffect(() => {
    setHandler(() => {
      listRef.current?.scrollToOffset({
        offset: -(HEADER_HEIGHT + 12),
        animated: true,
      });
    });
  }, [setHandler]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFetchingMore(false);
    try {
      const response = await axios.post(`${API_URL}/timeline`, {
        user_id: currentUser?.id,
        limit: 10,
      });
      const result = getPostResponseSchema.safeParse(response.data);
      if (result.success) {
        setPosts(result.data.posts);
        setCursor(result.data.next_cursor ?? undefined);
      }
    } catch (err) {
      console.error("Failed to refresh posts", err);
    }
  };

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
              refreshing={isRefetching}
              onRefresh={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                refetch();
              }}
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
        keyboardShouldPersistTaps="handled"
        ref={listRef}
        style={{
          backgroundColor: colorScheme === "light" ? "white" : "black",
        }}
        contentInset={{ top: HEADER_HEIGHT + 20 }}
        contentOffset={{ x: 0, y: -(HEADER_HEIGHT + 20) }}
        contentContainerStyle={{ paddingBottom: 75 }}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostPanel post={item} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              refetch();
            }}
            tintColor={colorScheme === "light" ? "black" : "white"}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
        )}
        scrollEventThrottle={16}
        onEndReached={() => {
          if (isFetchingMore || !cursor) return;
          setIsFetchingMore(true);
        
          axios
            .post(`${API_URL}/timeline`, {
              user_id: currentUser?.id,
              limit: 10,
              cursor: cursor,
            })
            .then((response) => {
              const result = getPostResponseSchema.safeParse(response.data);
              if (result.success) {
                setPosts((prev) => [...prev, ...result.data.posts]);
                setCursor(result.data.next_cursor ?? undefined);
              }
            })
            .catch((err) => console.error(err))
            .finally(() => setIsFetchingMore(false));
        }}
      />
      {!isDailyTaskDone && (
        <DailyTaskPopUp dailyTask={currentUser?.dailyTask} />
      )}
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
    height: 90,
    zIndex: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginTop: 50,
    resizeMode: "contain",
  },
  errorText: {
    textAlign: "center",
    marginTop: 150,
    fontSize: 16,
    color: "gray",
  },
});
