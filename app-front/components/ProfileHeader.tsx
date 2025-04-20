import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { User } from "@/features/user/schema";

type ProfileHeaderProps = {
  user: User;
  onLogout: () => void;
  onOpenFollowModal: () => void;
  setSelectedTab: (tab: "follows" | "followers") => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onLogout,
  onOpenFollowModal,
  setSelectedTab,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const styles = getStyles(colors);
  const backgroundColor = colorScheme === "light" ? "white" : "black";
  const handleOpenFollowModal = (tab: "follows" | "followers") => {
    setSelectedTab(tab);
    onOpenFollowModal();
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onLogout}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "ログアウト確認",
                "本当にログアウトしますか？",
                [
                  { text: "キャンセル", style: "cancel" },
                  { text: "はい", onPress: onLogout },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View style={styles.profileColumn}>
        <Image
          source={
            user.iconImageUrl
              ? { uri: user.iconImageUrl }
              : require("@/assets/images/profile.png")
          }
          style={styles.profileImage}
        />

        <View style={styles.statsContainer}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileBio}>{user.bio}</Text>

          <View style={styles.followContainer}>
            <TouchableOpacity
              style={styles.followBox}
              onPress={() => handleOpenFollowModal("follows")}
            >
              <Text style={styles.followCount}>{user.followsCount}</Text>
              <Text style={styles.followLabel}>フォロー</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.followBox}
              onPress={() => handleOpenFollowModal("followers")}
            >
              <Text style={styles.followCount}>{user.followersCount}</Text>
              <Text style={styles.followLabel}>フォロワー</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    headerContainer: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    topRow: {
      flexDirection: "row-reverse",
      paddingRight: 20,
      paddingTop: 8,
    },
    logoutText: {
      color: colors.tint,
      fontWeight: "600",
    },
    profileColumn: {
      flexDirection: "column",
      alignItems: "center",
      paddingHorizontal: 20,
      marginTop: 8,
    },
    profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    statsContainer: {
      flex: 1,
      alignItems: "center",
    },
    profileName: {
      fontSize: 20,
      paddingVertical: 8,
      fontWeight: "bold",
      color: colors.text,
    },
    profileBio: {
      fontSize: 14,
      color: colors.icon,
      marginBottom: 8,
    },
    followContainer: {
      flexDirection: "row",
    },
    followBox: {
      padding: 15,
    },
    followCount: {
      fontWeight: "bold",
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
    },
    followLabel: {
      fontSize: 12,
      color: colors.icon,
      textAlign: "center",
    },
  });

export default ProfileHeader;
