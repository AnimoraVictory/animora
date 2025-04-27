import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useHomeTabHandler } from '@/providers/HomeTabScrollContext';
import { useAuth } from '@/providers/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { PostTabSelector, PostTabType } from '@/components/PostsTabSelector';
import RecommendedPostsList from '@/components/RecommendedPostsList';
import FollowsPostsList from '@/components/FollowsPostsList';
import DailyTaskPopUp from '@/components/DailyTaskPopUp';

const HEADER_HEIGHT = 130;
const windowWidth = Dimensions.get('window').width;

export default function PostsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRefRecommended = useRef<any>(null);
  const listRefFollows = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { user: currentUser } = useAuth();
  const { setHandler } = useHomeTabHandler();
  const [selectedTab, setSelectedTab] = useState<PostTabType>('recommended');
  const isDailyTaskDone = !!currentUser?.dailyTask?.post;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const icon = colorScheme === 'light'
    ? require('../../assets/images/icon-green.png')
    : require('../../assets/images/icon-dark.png');

  const scrollToTab = (tab: PostTabType) => {
    setSelectedTab(tab);
    const pageIndex = tab === 'recommended' ? 0 : 1;
    scrollRef.current?.scrollTo({ x: pageIndex * windowWidth, animated: true });
  };

  const onScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / windowWidth);
    setSelectedTab(newIndex === 0 ? 'recommended' : 'follows');
  };

  // Homeタブ再タップ時の挙動設定
  useState(() => {
    setHandler(() => {
      if (selectedTab === 'recommended') {
        listRefRecommended.current?.scrollToOffset({ offset: -(HEADER_HEIGHT + 12), animated: true });
      } else {
        listRefFollows.current?.scrollToOffset({ offset: -(HEADER_HEIGHT + 12), animated: true });
      }
    });
  });

  return (
    <ThemedView style={styles(colors).container}>
      <Animated.View
        style={[
          styles(colors).header,
          {
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: colors.background,
          },
        ]}
      >
        <Image source={icon} style={styles(colors).logo} />
        <PostTabSelector
          selectedTab={selectedTab}
          onSelectTab={scrollToTab}
        />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ minHeight: '100%' }}
      >
        <View style={{ width: windowWidth }}>
          <RecommendedPostsList listRef={listRefRecommended} scrollY={scrollY} />
        </View>
        <View style={{ width: windowWidth }}>
          <FollowsPostsList listRef={listRefFollows} scrollY={scrollY} />
        </View>
      </Animated.ScrollView>

      {!isDailyTaskDone && currentUser?.dailyTask && (
        <DailyTaskPopUp dailyTask={currentUser.dailyTask} />
      )}
    </ThemedView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.middleBackground,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      zIndex: 10,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 40,
    },
    logo: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
      marginBottom: 8,
    },
  });
