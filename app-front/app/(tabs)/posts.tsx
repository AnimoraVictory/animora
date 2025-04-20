import React, { useEffect, useRef } from 'react';
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
  Easing,
  View,
} from 'react-native';
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PostPanel } from '@/components/PostPanel';
import { Colors } from '@/constants/Colors';
import { useHomeTabHandler } from '@/providers/HomeTabScrollContext';
import { useAuth } from '@/providers/AuthContext';
import DailyTaskPopUp from '@/components/DailyTaskPopUp';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  getPostResponseSchema,
  GetPostsResponse,
} from '@/features/post/schema';
import { fetchApi } from '@/utils/api';

export default function PostsScreen() {
  const colorScheme = useColorScheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYRef = useRef(0);
  const listRef = useRef<FlatList>(null);
  const HEADER_HEIGHT = 90;
  const { user: currentUser, token } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    isError,
    refetch,
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
        path: '/posts/timeline',
        schema: getPostResponseSchema,
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
  const icon =
    colorScheme === 'light'
      ? require('../../assets/images/icon-green.png')
      : require('../../assets/images/icon-dark.png');

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
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

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isLoading, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingOverlay}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome5 name="paw" size={48} color="#999" />
          </Animated.View>
        </View>
      </ThemedView>
    );
  }

  if (isError) {
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
              tintColor={colorScheme === 'light' ? 'black' : 'white'}
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
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        ]}
      >
        <Image source={icon} style={styles.logo} />
      </Animated.View>

      <Animated.FlatList
        keyboardShouldPersistTaps="handled"
        ref={listRef}
        style={{
          backgroundColor: colorScheme === 'light' ? 'white' : 'black',
        }}
        contentInset={{ top: HEADER_HEIGHT + 20 }}
        contentOffset={{ x: 0, y: -(HEADER_HEIGHT + 20) }}
        contentContainerStyle={{ paddingBottom: 75 }}
        data={data?.pages.flatMap((page) => page.posts) ?? []}
        keyExtractor={(item) => item.id}
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
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
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
        removeClippedSubviews={true}
        onEndReachedThreshold={0.5}
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
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginTop: 50,
    resizeMode: 'contain',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 150,
    fontSize: 16,
    color: 'gray',
  },
});
