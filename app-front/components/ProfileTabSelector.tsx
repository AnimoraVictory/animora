import { Colors } from "../constants/Colors";
import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import { useColorScheme } from "react-native";

export type ProfileTabType = "posts" | "mypet";

type ProfileTabSelectorProps = {
  scrollRef: React.RefObject<ScrollView>;
  selectedTab: ProfileTabType;
  onSelectTab: (tab: ProfileTabType) => void;
};

const windowWidth = Dimensions.get("window").width;

export const ProfileTabSelector: React.FC<ProfileTabSelectorProps> = ({
  selectedTab,
  onSelectTab,
  scrollRef,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "light" ? "white" : "black";
  const styles = getStyles(colors);

  const scrollToTab = (tab: ProfileTabType) => {
    onSelectTab(tab);
    const pageIndex = tab === "posts" ? 0 : 1;
    scrollRef.current?.scrollTo({ x: pageIndex * windowWidth, animated: true });
  };

  return (
    <View
      style={[styles.tabContainer, { backgroundColor }]}
    >
      <TouchableOpacity
        onPress={() => scrollToTab("posts")}
        style={[
          styles.tabButton,
          selectedTab === "posts" && styles.tabButtonActive,
        ]}
      >
        <Text style={styles.tabText}>投稿一覧</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => scrollToTab("mypet")}
        style={[
          styles.tabButton,
          selectedTab === "mypet" && styles.tabButtonActive,
        ]}
      >
        <Text style={styles.tabText}>マイペット</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: "row",
      justifyContent: "center",
      borderColor: colors.icon,
    },
    tabButton: {
      width: "50%",
      paddingVertical: 15,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    tabButtonActive: {
      borderBottomWidth: 2,
      borderColor: colors.tint,
    },
    tabText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
  });
