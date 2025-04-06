import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  Dimensions,
  RefreshControl,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { ProfileTabSelector, ProfileTabType } from "@/components/ProfileTabSelector";
import PetPanel from "@/components/PetPanel";
import ProfilePostPanel from "@/components/ProfilePostPanel";
import { User, Pet } from "@/constants/api";
import { Post } from "./PostPanel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";

const windowHeight = Dimensions.get("window").height;
const HEADER_HEIGHT = Math.min(windowHeight * 0.33, 280);

type Props = {
  userId: string;
};

const ProfileModal: React.FC<Props> = ({ userId }) => {
const API_URL = Constants.expoConfig?.extra?.API_URL;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const styles = getStyles(colors);
  const [selectedTab, setSelectedTab] = useState<ProfileTabType>("posts");

  const {
    data: user,
    refetch: refetchUser,
    isFetching: isRefreshing,
  } = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  const listData = selectedTab === "mypet" ? user?.pets ?? [] : user?.posts ?? [];

  const renderPets = (item: Pet) => (
    <View style={styles.petContainer}>
      <PetPanel pet={item} colorScheme={colorScheme} />
    </View>
  );

  const renderPosts = (item: Post) => (
    <ProfilePostPanel
      imageUrl={item.imageUrl}
      onPress={() => console.log("Tapped post:", item.id)}
    />
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <Text style={styles.userName}>{user?.name}</Text>
      <Text style={styles.userBio}>{user?.bio}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.fixedHeader}>
        {renderProfileHeader()}
        <ProfileTabSelector
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />
      </View>
      <FlatList
        key={selectedTab}
        contentInset={{ top: HEADER_HEIGHT }}
        contentOffset={{ x: 0, y: -HEADER_HEIGHT }}
        style={{ flex: 1, backgroundColor: colors.background }}
        data={listData as (Post | Pet)[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          selectedTab === "mypet" ? renderPets(item as Pet) : renderPosts(item as Post)
        }
        numColumns={selectedTab === "posts" ? 3 : 1}
        refreshControl={
            <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetchUser}
            tintColor={colorScheme === "light" ? "black" : "white"}
          />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {selectedTab === "mypet"
              ? "マイペットを登録しましょう！"
              : "投稿がありません"}
          </Text>
        }
      />
    </ThemedView>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: 70,
      backgroundColor: colors.background,
    },
    fixedHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      zIndex: 10,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    profileHeaderContainer: {
      marginBottom: 16,
    },
    userName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    userBio: {
      fontSize: 14,
      color: colors.text,
      textAlign: "center",
      marginTop: 4,
    },
    petContainer: {
      padding: 10,
      borderColor: colors.icon,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      marginTop: 32,
    },
  });

export default ProfileModal;
