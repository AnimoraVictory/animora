import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { Post } from "./PostPanel";
import CommentsModal from "./CommentsModal";
import { useAuth } from "@/providers/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import LikedUserModal from "./LikedUsesModal";
import { useModalStack } from "@/providers/ModalStackContext";

type Props = {
  post: Post;
  visible: boolean;
  onClose: () => void;
};

const { height, width } = Dimensions.get("window");

const PostModal: React.FC<Props> = ({ post, visible, onClose }) => {
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isLikedUserModalVisible, setIsLikedUserModalVisible] = useState(false);
  const slideAnimComment = useRef(new Animated.Value(height)).current;
  const slideAnimLike = useRef(new Animated.Value(height)).current;

  const [comments, setComments] = useState(post.comments);
  const { push, pop } = useModalStack();

  const { user } = useAuth();

  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const onOpenCommentModal = () => {
    setIsCommentModalVisible(true);
    Animated.timing(slideAnimComment, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onCloseCommentModal = () => {
    Animated.timing(slideAnimComment, {
      toValue: height * 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsCommentModalVisible(false));
  };

  const onOpenLikeModal = () => {
    setIsLikedUserModalVisible(true);
    push("1");
    Animated.timing(slideAnimLike, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onCloseLikeModal = () => {
    Animated.timing(slideAnimLike, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsLikedUserModalVisible(false);
      pop();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={[styles.modal, { backgroundColor: colors.middleBackground }]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.closeText, { color: colors.tint }]}>×</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={
              post.user.iconImageUrl
                ? { uri: post.user.iconImageUrl }
                : require("@/assets/images/profile.png")
            }
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: colors.text }]}>
            {post.user.name}
          </Text>
        </View>

        <Image source={{ uri: post.imageUrl }} style={styles.image} />

        <View style={styles.reactionRow}>
          <TouchableOpacity
            style={styles.reactionItem}
            onPress={onOpenLikeModal}
          >
            <Ionicons name="heart" size={20} color={colors.text} />
            <Text style={[styles.reactionText, { color: colors.text }]}>
              {post.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reactionItem, { marginLeft: 16 }]}
            onPress={onOpenCommentModal}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.reactionText, { color: colors.text }]}>
              {post.comments.length}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.caption, { color: colors.text }]}>
          {post.caption}
        </Text>
      </View>
      {isCommentModalVisible && (
        <CommentsModal
          comments={comments}
          slideAnim={slideAnimComment}
          visible={isCommentModalVisible}
          postId={post.id}
          currentUser={user}
          onClose={onCloseCommentModal}
          queryKey={["userProfile", post.user.email]}
          onNewComment={(newComment) =>
            setComments((prev) => [...prev, newComment])
          }
        />
      )}

      <LikedUserModal
        visible={isLikedUserModalVisible}
        onClose={onCloseLikeModal}
        likes={post.likes}
        currentUser={{
          id: user?.id ?? "",
          email: user?.email ?? "",
          name: user?.name ?? "",
          iconImageUrl: user?.iconImageUrl ?? "",
          bio: user?.bio ?? "",
        }}
        slideAnim={slideAnimLike}
        prevModalIdx={0}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    width,
    height,
    borderRadius: 12,
    padding: 16,
  },
  closeButton: {
    paddingTop: 40,
    alignSelf: "flex-end",
  },
  closeText: {
    fontSize: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: width * 1.4,
    borderRadius: 8,
    marginBottom: 12,
  },
  caption: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  reactionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default PostModal;
