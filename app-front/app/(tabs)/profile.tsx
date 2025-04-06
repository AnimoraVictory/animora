import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  useColorScheme,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/providers/AuthContext";
import { Colors } from "@/constants/Colors";
import { ProfileHeader } from "@/components/ProfileHeader";
import {
  ProfileTabSelector,
  ProfileTabType,
} from "@/components/ProfileTabSelector";
import { router } from "expo-router";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { PetRegiserModal } from "@/components/PetRegisterModal";
import { UserPetList } from "@/components/UserPetsList";
import { UserPostList } from "@/components/UserPostList";

const windowWidth = Dimensions.get("window").width;

const ProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const styles = getStyles(colors);

  const [selectedTab, setSelectedTab] = useState<ProfileTabType>("posts");
  const {
    user,
    loading: authLoading,
    logout,
    refetch: refetchUser,
  } = useAuth();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRegisterPetModalVisible, setIsRegisterPetModalVisible] =
    useState(false);

  const slideAnimProfile = useRef(new Animated.Value(windowWidth)).current;
  const slideAnimPet = useRef(new Animated.Value(windowWidth)).current;
  const backgroundColor = colorScheme == "light" ? "white" : "black"

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
    router.replace("/(auth)");
  };

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
    }).start(() => setIsEditModalVisible(false));
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
    }).start(() => setIsRegisterPetModalVisible(false));
  };

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const headerContent = (
    <>
      <ProfileHeader user={user} onLogout={handleLogout} />
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
    </>
  );

  const contentList =
    selectedTab === "mypet" ? (
      <UserPetList
        pets={user.pets}
        onRefresh={refetchUser}
        refreshing={authLoading}
        colorScheme={colorScheme}
        headerComponent={headerContent}
      />
    ) : (
      <UserPostList
        posts={user.posts}
        onRefresh={refetchUser}
        refreshing={authLoading}
        colorScheme={colorScheme}
        headerComponent={headerContent}
      />
    );

  return (
    <ThemedView style={[styles.container, {backgroundColor}]}>
      <View style={styles.topHeader}>
        <Text style={styles.userName}>{user.name}</Text>
      </View>
      {contentList}
      <ProfileEditModal
        visible={isEditModalVisible}
        onClose={closeEditProfileModal}
        slideAnim={slideAnimProfile}
        colorScheme={colorScheme}
        refetchUser={refetchUser}
        user={user}
      />
      <PetRegiserModal
        visible={isRegisterPetModalVisible}
        onClose={closeRegisterPetModal}
        slideAnim={slideAnimPet}
        colorScheme={colorScheme}
        refetchPets={refetchUser}
      />
    </ThemedView>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    topHeader: {
      paddingTop: 50,
      paddingBottom: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.icon,
    },
    userName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    },
    buttonText: {
      color: colors.text,
      fontWeight: "bold",
    },
  });

export default ProfileScreen;
