import React, { useState } from "react";
import {
  Modal,
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ColorSchemeName,
  Alert,
  Image,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { z } from "zod";
import { speciesMap, speciesOptions } from "@/constants/petSpecies";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/providers/AuthContext";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const petInputSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  petType: z.enum(["dog", "cat"], { required_error: "種類は必須です" }),
  species: z.string().min(1, { message: "品種を選択してください" }),
  birthDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "誕生日はYYYY-MM-DD形式で入力してください",
    }),
  iconImageUri: z.string().nullable(),
});

type PetForm = z.infer<typeof petInputSchema>;

const initialFormState: PetForm = {
  name: "",
  petType: "dog",
  species: "",
  birthDay: "",
  iconImageUri: null,
};

type RegisterPetModalProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  colorScheme: ColorSchemeName;
  refetchPets: () => void;
};

export const RegisterPetModal: React.FC<RegisterPetModalProps> = ({
  visible,
  onClose,
  slideAnim,
  colorScheme,
  refetchPets,
}) => {
  const { user } = useAuth();
  const colors = colorScheme === "light" ? Colors.light : Colors.dark;

  const [formData, setFormData] = useState<PetForm>(initialFormState);

  // セレクター用のモーダル表示状態
  const [showPetTypeSelector, setShowPetTypeSelector] = useState(false);
  const [showSpeciesSelector, setShowSpeciesSelector] = useState(false);
  const pickIconImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("権限エラー", "メディアライブラリへのアクセス許可が必要です");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData({ ...formData, iconImageUri: result.assets[0].uri });
    }
  };

  const registerPetMutation = useMutation({
    mutationFn: (data: FormData) => {
      return axios.post(`${API_URL}/pets/new`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });

  const handleSubmit = async () => {
    const backendSpecies = speciesMap[formData.petType][formData.species];
    const dataToValidate = { ...formData, species: backendSpecies };

    const result = petInputSchema.safeParse(dataToValidate);
    if (!result.success) {
      const errorMessage = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join("\n");
      Alert.alert("入力エラー", errorMessage);
      return;
    }

    // FormData の作成
    const fd = new FormData();
    if (!user?.id) {
      Alert.alert("エラー", "ユーザー情報が取得できませんでした");
      return;
    }
    fd.append("name", formData.name);
    fd.append("type", formData.petType);
    fd.append("species", backendSpecies);
    fd.append("birthDay", formData.birthDay);
    fd.append("userId", user?.id);
    // アイコン画像が選択されている場合
    if (formData.iconImageUri) {
      const filename = formData.iconImageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const mimeType = match ? `image/${match[1]}` : "image";
      fd.append("image", {
        uri: formData.iconImageUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    try {
      await registerPetMutation.mutateAsync(fd);
      Alert.alert("成功", "ペットが正常に登録されました");
      await refetchPets();
      setFormData(initialFormState);
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("登録エラー", "ペットの登録に失敗しました");
    }
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateX: slideAnim }],
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={{ color: colors.tint }}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            ペットを登録する
          </Text>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={pickIconImage}
          >
            {formData.iconImageUri ? (
              <Image
                source={{ uri: formData.iconImageUri }}
                style={styles.iconImage}
              />
            ) : (
              <Text style={[styles.iconPlaceholder, { color: colors.icon }]}>
                アイコン画像
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.inputTitle}>名前</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.icon, color: colors.text },
            ]}
            placeholder="名前"
            placeholderTextColor={colors.icon}
            value={formData.name}
            onChangeText={(value) => setFormData({ ...formData, name: value })}
          />
          <Text style={styles.inputTitle}>動物種</Text>
          <TouchableOpacity
            onPress={() => setShowPetTypeSelector(true)}
            style={[styles.selectorInput, { borderColor: colors.icon }]}
          >
            <Text style={{ color: colors.text }}>
              {formData.petType === "dog" ? "犬" : "猫"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.inputTitle}>品種</Text>
          <TouchableOpacity
            onPress={() => setShowSpeciesSelector(true)}
            style={[styles.selectorInput, { borderColor: colors.icon }]}
          >
            <Text style={{ color: colors.text }}>{formData.species}</Text>
          </TouchableOpacity>
          <Text style={styles.inputTitle}>誕生日</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.icon, color: colors.text },
            ]}
            placeholder="誕生日 (YYYY-MM-DD)"
            placeholderTextColor={colors.icon}
            value={formData.birthDay}
            onChangeText={(value) =>
              setFormData({ ...formData, birthDay: value })
            }
          />
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              登録する
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Modal transparent visible={showPetTypeSelector} animationType="fade">
          <TouchableOpacity
            style={styles.selectorOverlay}
            onPress={() => setShowPetTypeSelector(false)}
          >
            <View
              style={[
                styles.selectorContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.selectorTitle, { color: colors.text }]}>
                種類を選択
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFormData({ ...formData, petType: "dog", species: "" });
                  setShowPetTypeSelector(false);
                }}
              >
                <Text style={[styles.selectorItem, { color: colors.text }]}>
                  犬
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFormData({ ...formData, petType: "cat", species: "" });
                  setShowPetTypeSelector(false);
                }}
              >
                <Text style={[styles.selectorItem, { color: colors.text }]}>
                  猫
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <Modal transparent visible={showSpeciesSelector} animationType="fade">
          <TouchableOpacity
            style={styles.selectorOverlay}
            onPress={() => setShowSpeciesSelector(false)}
          >
            <View
              style={[
                styles.selectorContainerFixed,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.selectorTitle, { color: colors.text }]}>
                品種を選択
              </Text>
              <ScrollView>
                {speciesOptions[formData.petType].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => {
                      setFormData({ ...formData, species: s });
                      setShowSpeciesSelector(false);
                    }}
                  >
                    <Text style={[styles.selectorItem, { color: colors.text }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    padding: 20,
  },
  cancelButton: {
    position: "absolute",
    top: 50,
    left: 10,
    padding: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  selectorInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorContainer: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  // 固定高さのコンテナ（例: 300px）
  selectorContainerFixed: {
    width: "80%",
    height: 300,
    borderRadius: 10,
    padding: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  selectorItem: {
    fontSize: 16,
    paddingVertical: 10,
    textAlign: "center",
  },
  iconContainer: {
    alignSelf: "center",
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  iconImage: {
    width: "100%",
    height: "100%",
  },
  iconPlaceholder: {
    fontSize: 14,
  },
});

export default RegisterPetModal;
