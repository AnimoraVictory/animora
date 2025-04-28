import React from 'react';
import {
  Animated,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
  FlatList,
} from 'react-native';
import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { PostPanel } from '@/components/PostPanel';
import { useAuth } from '@/providers/AuthContext';
import { fetchApi } from '@/utils/api';
import {
  getPostsResponseSchema,
  GetPostsResponse,
} from '@/features/post/schema/response';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';

type Props = {
  scrollY: Animated.Value;
  listRef: React.RefObject<FlatList<any>>;
};

const HEADER_HEIGHT = 140;

export default function FollowsPostsList({ scrollY, listRef }: Props) {
  const { user: currentUser, token } = useAuth();
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    isError,
  } = useInfiniteQuery<
    GetPostsResponse,
    Error,
    InfiniteData<GetPostsResponse>,
    [string, string?],
    string | null
  >({
    queryKey: ['follows-posts'],
    queryFn: async ({ pageParam = null }) => {
      return await fetchApi({
        method: 'GET',
        path: `posts/follows?userId=${currentUser?.id}&limit=10${
          pageParam ? `&cursor=${pageParam}` : ''
        }`,
        schema: getPostsResponseSchema,
        options: {},
        token,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.posts.length < 10) return undefined;
      return lastPage.posts[lastPage.posts.length - 1]?.id;
    },
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.middleBackground },
        ]}
      >
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.middleBackground },
        ]}
      >
        <ThemedText style={{ color: 'gray' }}>
          投稿を取得できませんでした
        </ThemedText>
      </View>
    );
  }
  return (
    <Animated.FlatList
      keyboardShouldPersistTaps="handled"
      ref={listRef}
      data={data?.pages.flatMap((page) => page.posts) ?? []}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: colors.middleBackground }}
      renderItem={({ item }) => <PostPanel post={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await queryClient.invalidateQueries({
              queryKey: ['follows-posts'],
            });
          }}
          tintColor={colorScheme === 'light' ? 'black' : 'white'}
        />
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      updateCellsBatchingPeriod={100}
      removeClippedSubviews
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingBottom: 75 }}
      contentInset={{ top: HEADER_HEIGHT }}
      contentOffset={{ x: 0, y: -HEADER_HEIGHT }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
