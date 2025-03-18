import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/providers/AuthContext";
import { Colors } from "@/constants/Colors";
import { ProfileHeader } from "@/components/ProfileHeader";
import {
  ProfileTabSelector,
  ProfileTabType,
} from "@/components/ProfileTabSelector";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import z from "zod";
import { postSchema } from "./posts";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { RegisterPetModal } from "@/components/RegisterPetModal";
import PetPanel from "@/components/PetPanel";

import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const petSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  species: z.string().min(1),
  birthDay: z.string().min(1),
});

const getPetResponseSchema = z.object({
  pets: z.array(petSchema),
});

const getPostResponseSchema = z.object({
  posts: z.array(postSchema),
});

type Pet = z.infer<typeof petSchema>;
type Post = z.infer<typeof postSchema>;

const HEADER_HEIGHT = 250;
const ProfileScreen: React.FC = () => {
  const windowWidth = Dimensions.get("window").width;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const styles = getStyles(colors);
  const [selectedTab, setSelectedTab] = useState<ProfileTabType>("posts");
  const { user, loading: authLoading, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isRegisterPetModalVisible, setIsRegisterPetModalVisible] =
    useState<boolean>(false);
  const slideAnimProfile = useRef(new Animated.Value(windowWidth)).current;
  const slideAnimPet = useRef(new Animated.Value(windowWidth)).current;
  const openEditProfileModal = () => {
    setIsEditModalVisible(true);
    Animated.timing(slideAnimProfile, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeEditProfileModal = () => {
    Animated.timing(slideAnimProfile, {
      toValue: windowWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsEditModalVisible(false);
    });
  };

  const openRegisterPetModal = () => {
    setIsRegisterPetModalVisible(true);
    Animated.timing(slideAnimPet, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeRegisterPetModal = () => {
    Animated.timing(slideAnimPet, {
      toValue: windowWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsRegisterPetModalVisible(false);
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
    router.replace("/(auth)");
  };

  // ペット情報取得
  const {
    data: petData,
    isLoading: petLoading,
    error: petError,
    refetch: refetchPets,
  } = useQuery<Pet[]>({
    queryKey: ["pets", user?.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/pets/owner`, {
        params: { ownerId: user?.id },
      });
      const parsedResponse = getPetResponseSchema.parse(response.data);
      return parsedResponse.pets;
    },
    enabled: !!user?.id,
  });

  // 投稿一覧取得
  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useQuery<Post[]>({
    queryKey: ["posts", user?.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/posts/user`, {
        params: { authorId: user?.id },
      });
      const parsedResponse = getPostResponseSchema.parse(response.data);
      return parsedResponse.posts;
    },
    enabled: !!user?.id,
  });

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // タブに応じたデータ、読み込み・エラー状態
  const listData = selectedTab === "mypet" ? petData : postData;
  const isDataLoading = selectedTab === "mypet" ? petLoading : postLoading;
  const isDataError = selectedTab === "mypet" ? petError : postError;

  const renderPets = (item: Pet) => {
    return (
      <View style={styles.petContainer}>
        <PetPanel pet={item} />
      </View>
    );
  };

  const renderPosts = (item: Post) => {
    return (
      <View style={styles.postContainer}>
        <Text>{item.title}</Text>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.fixedHeader}>
        <ProfileHeader userName={user.name} onLogout={handleLogout} />
        <View style={styles.editButtonsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditProfileModal}
          >
            <Text style={styles.buttonText}>プロフィールを編集</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={openRegisterPetModal}
          >
            <Text style={styles.buttonText}>ペットを登録する</Text>
          </TouchableOpacity>
        </View>

        <ProfileTabSelector
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />
      </View>
      <FlatList
        data={listData as (Pet | Post)[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          selectedTab === "mypet"
            ? renderPets(item as Pet)
            : renderPosts(item as Post)
        }
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: HEADER_HEIGHT },
        ]}
        ListEmptyComponent={
          isDataLoading ? (
            <Text style={{ color: colors.text }}>読み込み中...</Text>
          ) : isDataError ? (
            <Text style={{ color: colors.text }}>エラーが発生しました</Text>
          ) : (
            <Text style={styles.emptyText}>
              {selectedTab === "mypet"
                ? "マイペットを登録しましょう！"
                : "投稿しましょう！"}
            </Text>
          )
        }
      />
      <ProfileEditModal
        visible={isEditModalVisible}
        onClose={() => closeEditProfileModal()}
        slideAnim={slideAnimProfile}
      />
      <RegisterPetModal
        visible={isRegisterPetModalVisible}
        onClose={() => closeRegisterPetModal()}
        slideAnim={slideAnimPet}
        colorScheme={colorScheme}
        refetchPets={refetchPets}
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
      zIndex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: 20,
    },
    petContainer: {
      padding: 10,
      borderColor: colors.icon,
    },
    postContainer: {
      padding: 10,
      borderColor: colors.icon,
    },
    emptyText: {
      padding: 20,
      fontSize: 16,
      color: colors.text,
    },
    editButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginTop: 10,
      marginBottom: 10,
    },
    editButton: {
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 16,
      width: 160,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    buttonText: {
      color: colors.text,
      fontWeight: "bold",
    },
  });

export default ProfileScreen;
