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

const UserProfileModal: React.FC<Props> = ({
  email,
  visible,
  onClose,
  slideAnim,
  currentUser,
  prevModalIdx,
}) => {
  const [selectedTab, setSelectedTab] = useState<"posts" | "mypet">("posts");
  const [selectedFollowTab, setSelectedFollowTab] = useState<
    "follows" | "followers"
  >("follows");
  const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);
  const slideAnimFollow = useRef(new Animated.Value(width)).current;

  const { push, pop, isTop } = useModalStack();
  const modalKey = `${prevModalIdx + 1}`;

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "light" ? "white" : "black";

  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

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
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsFollowModalVisible(false);
      pop();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 1 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          gestureState.dx > 1 &&
          isTop(modalKey),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx > 0) {
            slideAnim.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 10) {
            Animated.timing(slideAnim, {
              toValue: width,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onClose());
          } else {
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [modalKey, slideAnim, isTop, onClose]
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [- 20,0 ],
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
              onRefresh={refetch}
              tintColor={colorScheme === "light" ? "black" : "white"}
            />
          }
          contentInset={{ top: 80 }}
          contentOffset={{x: 0, y: -80 }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
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
              onSelectTab={setSelectedTab}
              scrollRef={scrollRef}
            />
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const newIndex = Math.round(offsetX / windowWidth);
              setSelectedTab(newIndex === 0 ? "posts" : "mypet");
            }}
            scrollEventThrottle={16}
          >
            <View style={{ width: windowWidth }}>
              <UserPostList posts={user.posts} colorScheme={colorScheme} />
            </View>
            <View style={{ width: windowWidth }}>
              <UserPetList pets={user.pets} colorScheme={colorScheme} />
            </View>
          </ScrollView>
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
          users={
            selectedFollowTab === "followers" ? user.followers : user.follows
          }
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
    height: 80,
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
