import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import CommentsModal from './CommentsModal';
import { Ionicons } from '@expo/vector-icons';
import LikedUserModal from './LikedUsesModal';
import { useModalStack } from '@/providers/ModalStackContext';
import usePostModal from '@/features/post/usePostModal';
import { PostResponse } from '@/features/post/schema/response';

type Props = {
  post: PostResponse;
  visible: boolean;
  onClose: () => void;
};

const { height, width } = Dimensions.get('window');

const PostModal: React.FC<Props> = ({ post, visible, onClose }) => {
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isLikedUserModalVisible, setIsLikedUserModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnimComment = useRef(new Animated.Value(height)).current;
  const slideAnimLike = useRef(new Animated.Value(height)).current;

  const { push, pop } = useModalStack();

  const { isMyPost, comments, onNewComment, handleDelete } = usePostModal({
    post,
    onClose,
  });

  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const onOpenCommentModal = () => {
    setIsCommentModalVisible(true);
    Animated.timing(slideAnimComment, {
      toValue: 0,
      duration: 100,
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
    push('1');
    Animated.timing(slideAnimLike, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onCloseLikeModal = () => {
    Animated.timing(slideAnimLike, {
      toValue: height,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsLikedUserModalVisible(false);
      pop();
    });
  };

  const handleDeleteButton = () => {
    Alert.alert(
      '削除の確認',
      '本当に削除してよろしいですか？',
      [
        {
          text: 'キャンセル',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: '削除',
          onPress: handleDelete,
        },
      ],
      { cancelable: true }
    );
    setMenuVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{backgroundColor: colors.middleBackground}}>
      <ScrollView contentContainerStyle={{ minHeight: height, paddingBottom: 300}}>
      <View
        style={[styles.modal,]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.tint }]}>×</Text>
          </TouchableOpacity>
          {isMyPost && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={[styles.menuText, { color: colors.tint }]}>⋯</Text>
            </TouchableOpacity>
          )}
        </View>

        {menuVisible && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteButton}
            >
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

        <View style={styles.header}>
          <Image
            source={
              post.user.iconImageUrl
                ? { uri: post.user.iconImageUrl }
                : require('@/assets/images/profile.png')
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
      </ScrollView>
      </View>
      {isCommentModalVisible && (
        <CommentsModal
          comments={comments}
          slideAnim={slideAnimComment}
          visible={isCommentModalVisible}
          postId={post.id}
          onClose={onCloseCommentModal}
          queryKey={['userProfile', post.user.email]}
          onNewComment={onNewComment}
        />
      )}

      <LikedUserModal
        visible={isLikedUserModalVisible}
        onClose={onCloseLikeModal}
        likes={post.likes}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  closeButton: {
    paddingTop: 40,
    alignSelf: 'flex-start',
  },
  menuButton: {
    paddingTop: 40,
    alignSelf: 'flex-end',
  },
  menuText: {
    fontSize: 24,
  },
  menuOverlay: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 4,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: width * 1.4,
    borderRadius: 8,
    marginBottom: 12,
  },
  caption: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reactionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default PostModal;
