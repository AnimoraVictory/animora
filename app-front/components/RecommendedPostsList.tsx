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
import { ThemedText } from '@/components/ThemedText';
import { PostPanel } from '@/components/PostPanel';
import { fetchApi } from '@/utils/api';
import {
  getPostsResponseSchema,
  GetPostsResponse,
} from '@/features/post/schema/response';
import { useAuth } from '@/providers/AuthContext';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

const HEADER_HEIGHT = 150;

type Props = {
  scrollY: Animated.Value;
  listRef: React.RefObject<FlatList<any>>;
};

export default function RecommendedPostsList({ scrollY, listRef }: Props) {
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
    queryKey: ['posts'],
    queryFn: async ({ pageParam = null }) => {
      return await fetchApi({
        method: 'POST',
        path: 'posts/timeline',
        schema: getPostsResponseSchema,
        options: {
          data: {
            user_id: currentUser?.id,
            limit: 10,
            cursor: pageParam,
          },
        },
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.errorText}>
          ポストが取得できませんでした
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
            await queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator
              size="small"
              color={colorScheme === 'light' ? '#000' : '#fff'}
            />
          </View>
        ) : null
      }
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
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
});
