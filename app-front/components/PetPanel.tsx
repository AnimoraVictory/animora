import { reverseSpeciesMap } from "@/constants/petSpecies";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  ColorSchemeName,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import z from "zod";
import Constants from "expo-constants";
import PetEditModal from "./PetEditModal";
import { Colors } from "@/constants/Colors";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const petSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["dog", "cat"], { required_error: "種類は必須です" }),
  species: z.string().min(1),
  birthDay: z.string().min(1),
});

type Pet = z.infer<typeof petSchema>;

type PetPanelProps = {
  pet: Pet;
  colorScheme: ColorSchemeName;
};

const birthDayParser = (birthDay: string) => {
  const [year, month, day] = birthDay.split("-");
  return `${year}年${month}月${day}日`;
};

const _PetPanel: React.FC<PetPanelProps> = ({ pet, colorScheme }) => {
  const colors = Colors[colorScheme ?? "light"];
  const panelBackgroundColor =
    colorScheme === "light" ? "rgba(0,0,0,0.1)" : "#333333";
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const imageHeight = windowWidth;

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnimEditPet = useRef(new Animated.Value(imageHeight)).current;
  const queryClient = useQueryClient();

  const openEditPetModal = () => {
    setIsEditModalVisible(true);
    Animated.timing(slideAnimEditPet, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeEditPetModal = () => {
    Animated.timing(slideAnimEditPet, {
      toValue: windowHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsEditModalVisible(false);
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "削除の確認",
      "本当に削除してよろしいですか？",
      [
        {
          text: "キャンセル",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "削除",
          onPress: async () => {
            try {
              // axiosを使用してDELETEリクエストを送信
              const response = await axios.delete(`${API_URL}/pets/delete`, {
                params: { petId: pet.id },
              });
              if (response.status === 200) {
                // queryKey: ["pets"] のキャッシュを無効化して最新状態に更新
                queryClient.invalidateQueries({ queryKey: ["pets"] });
              } else {
                throw new Error("削除に失敗しました");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("エラー", "削除に失敗しました");
            }
          },
        },
      ],
      { cancelable: true }
    );
    setMenuVisible(false);
  };

  const handleOpenEditPetModal = () => {
    openEditPetModal();
    setMenuVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: panelBackgroundColor }]}>
      <View style={styles.headerOverlay}>
        <Text style={[styles.petNameHeader, { color: colors.tint }]}>
          {pet.name}
        </Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={[styles.menuIcon, { color: colors.tint }]}>⋯</Text>
        </TouchableOpacity>
      </View>
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: pet.imageUrl }}
          style={[styles.image, { width: windowWidth, height: imageHeight }]}
        />
      </View>

      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOpenEditPetModal}
          >
            <Text>編集</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Text>削除</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setMenuVisible(false)}
          >
            <Text>閉じる</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={[styles.subText, { color: colors.tint }]}>
          {reverseSpeciesMap[pet.type][pet.species]}
        </Text>
        <Text style={[styles.subText, { color: colors.tint }]}>
          {birthDayParser(pet.birthDay)}
        </Text>
      </View>

      <PetEditModal
        visible={isEditModalVisible}
        onClose={closeEditPetModal}
        slideAnim={slideAnimEditPet}
        colorScheme={colorScheme}
        pet={pet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  image: {
    resizeMode: "cover",
  },
  petNameOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subText: {
    fontSize: 16,
    marginVertical: 2,
  },
  fullScreenOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  headerOverlay: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  petNameHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "bold",
  },

  menuOverlay: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 4,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 8,
  },
});

const PetPanel = React.memo(_PetPanel);

export default PetPanel;
