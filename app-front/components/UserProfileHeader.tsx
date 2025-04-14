import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { User } from "@/constants/api";

type UserProfileHeaderProps = {
  isMe: boolean;
  user: User;
  onPressFollow: () => void;
  onOpenFollowModal: () => void;
  setSelectedTab: (tab: "follows" | "followers") => void;
  isFollowing: boolean;
};

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  isMe,
  user,
  onPressFollow,
  onOpenFollowModal,
  setSelectedTab,
  isFollowing,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "light" ? "white" : "black";

  const handleOpenFollowModal = (tab: "follows" | "followers") => {
    setSelectedTab(tab);
    onOpenFollowModal();
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      <Text style={[styles.profileName, { color: colors.tint }]}>
        {user.name}
      </Text>
      <Text style={[styles.profileBio, { color: colors.tint }]}>
        {user.bio}
      </Text>

      <View style={styles.row}>
        <Image
          source={{ uri: user.iconImageUrl }}
          style={styles.profileImage}
        />

        <View style={styles.rightBox}>
          <View style={styles.followRow}>
            <TouchableOpacity
              style={styles.followBox}
              onPress={() => handleOpenFollowModal("follows")}
            >
              <Text style={[styles.followCount, { color: colors.tint }]}>
                {user.followsCount}
              </Text>
              <Text style={[styles.followLabel, { color: colors.tint }]}>
                フォロー
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.followBox}
              onPress={() => handleOpenFollowModal("followers")}
            >
              <Text style={[styles.followCount, { color: colors.tint }]}>
                {user.followersCount}
              </Text>
              <Text style={[styles.followLabel, { color: colors.tint }]}>
                フォロワー
              </Text>
            </TouchableOpacity>
            {!isMe && (
              <TouchableOpacity
                style={[styles.followButton, { borderColor: colors.tint }]}
                onPress={onPressFollow}
              >
                <Text style={[styles.followButtonText, { color: colors.tint }]}>
                  {isFollowing ? "フォロー解除" : "フォローする"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileBio: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  rightBox: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
  },
  followRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  followBox: {
    marginRight: 16,
    alignItems: "center",
  },
  followCount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  followLabel: {
    fontSize: 12,
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default UserProfileHeader;
