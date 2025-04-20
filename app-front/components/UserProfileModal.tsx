import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponder,
  ScrollView,
  RefreshControl,
  Easing,
  Pressable,
} from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";
import { User, UserBase } from "@/constants/api";
import { UserPostList } from "./UserPostList";
import { UserPetList } from "./UserPetsList";
import { ProfileTabSelector } from "./ProfileTabSelector";
import UserProfileHeader from "./UserProfileHeader";
import UsersModal from "./UsersModal";
import { useModalStack } from "@/providers/ModalStackContext";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const API_URL = Constants.expoConfig?.extra?.API_URL;

type Props = {
  email: string;
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  currentUser: UserBase;
  prevModalIdx: number;
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const UserProfileModal: React.FC<Props> = ({
  email,
  visible,
  onClose,
  slideAnim,
  currentUser,
  prevModalIdx,
}) => {
  const [selectedFollowTab, setSelectedFollowTab] = useState<
    "follows" | "followers"
  >("follows");
  const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);
  const slideAnimFollow = useRef(new Animated.Value(width)).current;
  const [scrollX, setScrollX] = useState(0);

  const { push, pop, isTop } = useModalStack();
  const modalKey = `${prevModalIdx + 1}`;

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "light" ? "white" : "black";

  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const selectedTab = scrollX < windowWidth / 2 ? "posts" : "mypet";
  const postListWidth = useRef(0);

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<User>({
    queryKey: ["userProfile", email],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/users/?email=${email}`);
      return res.data.user;
    },
    enabled: !!email && visible,
  });

  const isMe = useMemo(() => {
    return !!user?.id && user.id === currentUser.id;
  }, [user?.id]);

  const isFollowing = useMemo(() => {
    if (!user) return false;
    return user.followers.some((f) => f.id === currentUser.id);
  }, [user, currentUser.id]);

  const followMutation = useMutation({
    mutationFn: () =>
      axios.post(
        `${API_URL}/users/follow?toId=${user?.id}&fromId=${currentUser.id}`
      ),
    onSuccess: () => {
      queryClient.setQueryData(
        ["userProfile", email],
        (prev: User | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            followers: [...prev.followers, currentUser],
            followersCount: prev.followersCount + 1,
          };
        }
      );
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () =>
      axios.delete(
        `${API_URL}/users/unfollow?toId=${user?.id}&fromId=${currentUser.id}`
      ),
    onSuccess: () => {
      queryClient.setQueryData(
        ["userProfile", email],
        (prev: User | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            followers: prev.followers.filter((f) => f.id !== currentUser.id),
            followersCount: prev.followersCount - 1,
          };
        }
      );
    },
  });

  const handlePressFollowButton = () => {
    isFollowing ? unfollowMutation.mutate() : followMutation.mutate();
  };

  const onOpenFollowModal = () => {
    setIsFollowModalVisible(true);
    push(`${prevModalIdx + 2}`);
    Animated.timing(slideAnimFollow, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onCloseFollowModal = () => {
    Animated.timing(slideAnimFollow, {
      toValue: width,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsFollowModalVisible(false);
      pop();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const { dx, dy } = gestureState;
          const isHorizontalSwipe =
            Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5;
          return isHorizontalSwipe;
        },
        onPanResponderRelease: (e, gestureState) => {
          const dx = gestureState.dx;
          const startX = e.nativeEvent.pageX;
          if (!isTop(modalKey)) {
            return;
          }
          if (selectedTab === "posts") {
            if (dx < -30) {
              scrollRef.current?.scrollTo({ x: windowWidth, animated: true });
            } else if (dx > 30) {
              // posts にいて右スワイプ → モーダル閉じる
              Animated.timing(slideAnim, {
                toValue: windowWidth,
                duration: 100,
                useNativeDriver: true,
              }).start(() => onClose());
            }
          } else if (selectedTab === "mypet") {
            const leftEdgeThreshold = windowWidth / 2 + 50;
            const adjustedStartX = startX;
            if (dx > 30) {
              if (adjustedStartX < leftEdgeThreshold) {
                // 左端からのスワイプとみなして閉じる
                Animated.timing(slideAnim, {
                  toValue: windowWidth,
                  duration: 100,
                  useNativeDriver: true,
                }).start(() => onClose());
              } else {
                // pets にいて右スワイプ && 画面内から → post に戻す
                scrollRef.current?.scrollTo({ x: 0, animated: true });
              }
            }
          }

          // 上記に該当しないときは何もしない
        },
      }),
    [selectedTab, scrollRef, slideAnim, onClose]
  );

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && isLoading) {
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
  }, [isLoading, visible]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (visible) {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
      setScrollX(0);
    }
  }, [visible]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (!user || isLoading) {
    return (
      <Modal visible={visible} animationType="none" transparent>
        <Animated.View
          style={[
            styles.overlay,
            {
              transform: [{ translateX: slideAnim }],
              backgroundColor: colors.middleBackground,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome5 name="paw" size={48} color="#000" />
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{ translateX: slideAnim }],
            backgroundColor: colors.middleBackground,
          },
        ]}
        {...panResponder.panHandlers}
        pointerEvents="box-none"
      >
        <View
          style={[styles.topHeader, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backText}>＜</Text>
          </TouchableOpacity>
          <Animated.Text
            style={[
              styles.userName,
              { color: colors.tint, opacity: headerOpacity },
            ]}
          >
            {user.name}
          </Animated.Text>
        </View>

        <ScrollView
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
          contentInset={{ top: 90 }}
          contentOffset={{ x: 0, y: -90 }}
          scrollEventThrottle={16}
          contentContainerStyle={{ minHeight: windowHeight * 0.6 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <View style={{ backgroundColor }}>
            <UserProfileHeader
              key={prevModalIdx}
              isMe={isMe}
              user={user}
              onPressFollow={handlePressFollowButton}
              onOpenFollowModal={onOpenFollowModal}
              setSelectedTab={setSelectedFollowTab}
              isFollowing={isFollowing}
            />
            <ProfileTabSelector
              selectedTab={selectedTab}
              onSelectTab={(tab) => {
                scrollRef.current?.scrollTo({
                  x: tab === "posts" ? 0 : windowWidth,
                  animated: true,
                });
                setScrollX(tab === "posts" ? 0 : windowWidth);
              }}
              scrollRef={scrollRef}
            />
          </View>

          <View pointerEvents="box-none">
            <Pressable>
              <ScrollView
                horizontal
                pagingEnabled
                ref={scrollRef}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const offsetX = event.nativeEvent.contentOffset.x;
                  setScrollX(offsetX);
                }}
                scrollEventThrottle={16}
              >
                <View
                  style={{ width: windowWidth }}
                  onLayout={(e) => {
                    postListWidth.current = e.nativeEvent.layout.width;
                  }}
                >
                  <UserPostList posts={user.posts} colorScheme={colorScheme} />
                </View>
                <View style={{ width: windowWidth }}>
                  <UserPetList pets={user.pets} colorScheme={colorScheme} />
                </View>
              </ScrollView>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>

      {visible && user && isFollowModalVisible && (
        <UsersModal
          key={prevModalIdx + 1}
          prevModalIdx={prevModalIdx + 1}
          visible={isFollowModalVisible}
          user={user}
          currentUser={currentUser}
          onClose={onCloseFollowModal}
          follows={user.follows}
          followers={user.followers}
          selectedTab={selectedFollowTab}
          setSelectedTab={setSelectedFollowTab}
          slideAnim={slideAnimFollow}
        />
      )}
    </Modal>
  );
};

export default UserProfileModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  topHeader: {
    position: "absolute",
    top: 0,
    height: 90,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 42,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    zIndex: 2,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 44,
  },
  backText: {
    fontSize: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
