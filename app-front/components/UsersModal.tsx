import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { UserBase } from "@/constants/api";
import UserProfileModal from "./UserProfileModal";
import { useModalStack } from "@/providers/ModalStackContext";
import UsersList from "./UsersList";

const { width, height } = Dimensions.get("window");

type Props = {
  user: UserBase;
  visible: boolean;
  onClose: () => void;
  follows: UserBase[];
  followers: UserBase[];
  selectedTab: "follows" | "followers";
  setSelectedTab: (tab: "follows" | "followers") => void;
  slideAnim: Animated.Value;
  prevModalIdx: number;
  currentUser: UserBase;
};

const UsersModal: React.FC<Props> = ({
  user,
  visible,
  onClose,
  follows,
  followers,
  selectedTab,
  setSelectedTab,
  slideAnim,
  prevModalIdx,
  currentUser,
}) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null
  );
  const slideAnimProfile = useRef(new Animated.Value(width)).current;
  const { push, pop, isTop } = useModalStack();
  const modalKey = `${prevModalIdx + 1}`;

  useEffect(() => {
    if (visible) {
      if (selectedTab === "followers") {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ x: width, animated: false });
        });
      }
    }
  }, [visible]);
  const openUserProfile = (email: string) => {
    setSelectedUserEmail(email);
    setIsProfileModalVisible(true);
    push(`${prevModalIdx + 2}`);
    Animated.timing(slideAnimProfile, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeUserProfile = () => {
    Animated.timing(slideAnimProfile, {
      toValue: width,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsProfileModalVisible(false);
      pop();
    });
  };

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(
    new Animated.Value(selectedTab === "followers" ? width : 0)
  ).current;

  const scrollToTab = (tab: "follows" | "followers") => {
    const toValue = tab === "follows" ? 0 : width;

    Animated.timing(scrollX, {
      toValue,
      duration: 100, // ← ここで速度調整（小さいほど速い）
      useNativeDriver: false,
    }).start(() => {
      setSelectedTab(tab);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
        },
        onPanResponderRelease: (evt, gestureState) => {
          const { dx } = gestureState;

          if (!isTop(modalKey)) return;

          if (selectedTab === "follows") {
            if (dx > 30) {
              Animated.timing(slideAnim, {
                toValue: width,
                duration: 100,
                useNativeDriver: true,
              }).start(() => onClose());
            } else if (dx < -30) {
              scrollRef.current?.scrollTo({ x: width, animated: true });
              setSelectedTab("followers");
            }
          } else if (selectedTab === "followers") {
            if (dx < -30 && evt.nativeEvent.pageX < 50) {
              Animated.timing(slideAnim, {
                toValue: width,
                duration: 100,
                useNativeDriver: true,
              }).start(() => onClose());
            } else if (dx > 30) {
              scrollRef.current?.scrollTo({ x: 0, animated: true });
              setSelectedTab("follows");
            }
          }
        },
      }),
    [isTop, slideAnim, onClose]
  );

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Modal
      key={prevModalIdx}
      visible={visible}
      transparent
      animationType="none"
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.middleBackground,
            transform: [{ translateX: slideAnim }],
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
          <Text style={[styles.headerUserName, { color: colors.tint }]}>
            {user.name}
          </Text>
        </View>
        <ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          contentInset={{ top: 90 }}
          contentOffset={{ x: 0, y: -90 }}
        >
          <View style={styles.tabHeader}>
            <TouchableOpacity
              onPress={() => scrollToTab("follows")}
              style={[
                styles.tabButton,
                selectedTab === "follows" && { borderBottomColor: colors.tint },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "follows" && styles.activeTabText,
                  { color: colors.tint },
                ]}
              >
                フォロー中
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => scrollToTab("followers")}
              style={[
                styles.tabButton,
                selectedTab === "followers" && {
                  borderBottomColor: colors.tint,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "followers" && styles.activeTabText,
                  { color: colors.tint },
                ]}
              >
                フォロワー
              </Text>
            </TouchableOpacity>
          </View>
          <View pointerEvents="box-none">
            <Pressable style={{ minHeight: height }}>
              <ScrollView
                horizontal
                pagingEnabled
                ref={scrollRef}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <UsersList
                  users={follows}
                  onSelectUser={openUserProfile}
                  backgroundColor={colors.middleBackground}
                />
                <UsersList
                  users={followers}
                  onSelectUser={openUserProfile}
                  backgroundColor={colors.middleBackground}
                />
              </ScrollView>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
      <UserProfileModal
        prevModalIdx={prevModalIdx + 1}
        key={prevModalIdx + 1}
        currentUser={currentUser}
        email={selectedUserEmail ?? ""}
        visible={isProfileModalVisible && !!selectedUserEmail}
        onClose={closeUserProfile}
        slideAnim={slideAnimProfile}
      />
    </Modal>
  );
};

export default UsersModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  topHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    paddingTop: 40,
    zIndex: 2,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 44,
    zIndex: 1,
  },
  backText: {
    fontSize: 20,
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "center",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width,
    height: height,
  },
  userItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
