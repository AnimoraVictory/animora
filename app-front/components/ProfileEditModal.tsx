import React, { useState, useEffect } from "react";
import {
  Modal,
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ColorSchemeName,
} from "react-native";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";
import { z } from "zod";
import { User } from "@/constants/api";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const profileEditSchema = z.object({
  imageUri: z.string().nullable(),
  name: z.string().min(1, { message: "名前は必須です" }),
  bio: z.string().min(1, { message: "自己紹介を入力してください" }),
});
export type ProfileEditForm = z.infer<typeof profileEditSchema>;

const getInitialProfileState = (user: User): ProfileEditForm => ({
  imageUri: user.iconImageUrl || null,
  name: user.name || "",
  bio: user.bio || "",
});

type ProfileEditModalProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  colorScheme: ColorSchemeName;
  refetchUser: () => Promise<void>;
  user: User;
};

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
  slideAnim,
  colorScheme,
  refetchUser,
  user,
}) => {
  const colors = colorScheme === "light" ? Colors.light : Colors.dark;
  const [formData, setFormData] = useState<ProfileEditForm>(
    getInitialProfileState(user)
  );

  useEffect(() => {
    setFormData(getInitialProfileState(user));
  }, [user]);

  // 画像選択処理
  const pickProfileImage = async () => {
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
      setFormData({ ...formData, imageUri: result.assets[0].uri });
    }
  };

  // API でプロフィール更新を行うための Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: FormData) => {
      return axios.put(`${API_URL}/users/update?id=${user.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });

  const handleSubmit = async () => {
    const parseResult = profileEditSchema.safeParse(formData);
    if (!parseResult.success) {
      const errorMessages = Object.values(
        parseResult.error.flatten().fieldErrors
      )
        .flat()
        .join("\n");
      Alert.alert("入力エラー", errorMessages);
      return;
    }

    const fd = new FormData();

    fd.append("name", formData.name);
    fd.append("bio", formData.bio);

    if (
      formData.imageUri &&
      formData.imageUri !== user.iconImageUrl // 変更されているか確認
    ) {
      const filename = formData.imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const mimeType = match ? `image/${match[1]}` : "image";
      fd.append("image", {
        uri: formData.imageUri,
        name: filename,
        type: mimeType,
      } as any);
    }
    try {
      await updateProfileMutation.mutateAsync(fd);
      Alert.alert("成功", "プロフィールが更新されました");
      await refetchUser();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("更新エラー", "プロフィール更新に失敗しました");
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
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={{ color: colors.tint }}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            プロフィール編集
          </Text>
          <TouchableOpacity
            onPress={pickProfileImage}
            style={styles.iconContainer}
          >
            {formData.imageUri ? (
              <Image
              source={ {uri: formData.imageUri}}
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
            style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
            placeholder="名前"
            placeholderTextColor={colors.icon}
            value={formData.name}
            onChangeText={(value) =>
              setFormData({ ...formData, name: value })
            }
          />
          <Text style={styles.inputTitle}>自己紹介</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
            placeholder="自己紹介"
            placeholderTextColor={colors.icon}
            value={formData.bio}
            onChangeText={(value) =>
              setFormData({ ...formData, bio: value })
            }
            multiline
          />
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              更新する
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    padding: 20,
    borderRadius: 10,
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
    marginTop: 10,
    paddingBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
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
  submitButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
});

export default ProfileEditModal;
