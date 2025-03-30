import {
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/app/_layout";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthContext";
import { useRouter } from "expo-router";

type Props = {
  photoUri: string;
  onClose: () => void;
};

const postInputSchema = z.object({
  imageUri: z.string().min(1),
  caption: z.string().min(0),
  userId: z.string().uuid(),
});

type PostForm = z.infer<typeof postInputSchema>;

export function CreatePostModal({ photoUri, onClose }: Props) {
  const router = useRouter();

  const { user } = useAuth();
  const initialFormState = {
    imageUri: photoUri,
    caption: "",
    userId: user?.id ?? "",
  };

  const [formData, setFormData] = useState<PostForm>(initialFormState);

  const createPostMutation = useMutation({
    mutationFn: (data: FormData) => {
      return axios.post(`${API_URL}/posts`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      Alert.alert("投稿完了", "投稿が完了しました！");
      onClose();
      router.replace("/(tabs)/posts");
    },
    onError: (error) => {
      console.error(`error: ${error}`);
      Alert.alert("エラー", "投稿に失敗しました。");
    },
  });

  const handleSubmit = async () => {
    const result = postInputSchema.safeParse(formData);
    if (!result.success) {
      const errorMessage = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join("\n");
      Alert.alert("フォームエラー", errorMessage);
      return;
    }

    const fd = new FormData();
    fd.append("image", {
      uri: formData.imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);
    fd.append("caption", formData.caption);
    fd.append("userId", formData.userId);

    createPostMutation.mutate(fd);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.postButton}>投稿</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.captionWrapper}>
            <TextInput
              placeholder="キャプションを入力"
              placeholderTextColor="#fff"
              style={styles.input}
              value={formData.caption}
              onChangeText={(value) =>
                setFormData({ ...formData, caption: value })
              }
              multiline
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
  },
  inner: {
    backgroundColor: "black",
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  postButton: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  imageWrapper: {
    position: "absolute",
    top: 100,
    bottom: 100,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  image: {
    width: "80%",
    height: "100%",
    borderRadius: 30,
  },
  captionWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
});
