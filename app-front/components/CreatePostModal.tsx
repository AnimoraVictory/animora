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
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/app/_layout";
import { z } from "zod";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthContext";
import { useRouter } from "expo-router";

type Props = {
  photoUri: string;
  onClose: () => void;
  dailyTaskId: string | undefined;
};

const postInputSchema = z.object({
  imageUri: z.string().min(1),
  caption: z.string().min(0),
  userId: z.string().uuid(),
  dailyTaskId: z.string().uuid().optional(),
});

type PostForm = z.infer<typeof postInputSchema>;

export function CreatePostModal({ photoUri, onClose, dailyTaskId }: Props) {
  const router = useRouter();

  const { user } = useAuth();
  const initialFormState = {
    imageUri: photoUri,
    caption: "",
    userId: user?.id ?? "",
    dailyTaskId: dailyTaskId ?? undefined,
  };

  const [formData, setFormData] = useState<PostForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (data: FormData) => {
      return axios.post(`${API_URL}/posts/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      setIsSubmitting(true);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      Alert.alert("投稿完了", "投稿が完了しました！");
      setIsSubmitting(false);
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
    if (formData.dailyTaskId) {
      fd.append("dailyTaskId", formData.dailyTaskId);
    }

    createPostMutation.mutate(fd);
  };

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSubmitting) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isSubmitting]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.inner}>
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <FontAwesome5 name="paw" size={48} color="#fff" />
            </Animated.View>
          </View>
        )}
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
            <View style={styles.captionInputContainer}>
              {user?.iconImageUrl && (
                <Image
                  source={
                    user.iconImageUrl
                      ? { uri: user.iconImageUrl }
                      : require("@/assets/images/profile.png")
                  }
                  style={styles.avatar}
                />
              )}
              <TextInput
                placeholder="キャプションを入力..."
                placeholderTextColor="#888"
                style={styles.captionInput}
                value={formData.caption}
                onChangeText={(value) =>
                  setFormData({ ...formData, caption: value })
                }
                multiline
              />
            </View>
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
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  captionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginTop: 4,
  },

  captionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#000",
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
