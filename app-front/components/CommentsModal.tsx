import React, { useRef } from 'react';
import {
  Modal,
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { z } from 'zod';
import CommentInput from '@/components/CommentInput';
import { commentSchema } from '@/features/comment/schema';

export type Comment = z.infer<typeof commentSchema>;

type CommentsModalProps = {
  postId: string;
  visible: boolean;
  comments: Comment[];
  onClose: () => void;
  slideAnim: Animated.Value;
  queryKey: unknown[];
  onNewComment: (comment: Comment) => void;
};

const CommentsModal: React.FC<CommentsModalProps> = ({
  postId,
  visible,
  comments,
  onClose,
  slideAnim,
  queryKey,
  onNewComment,
}) => {
  const windowHeight = Dimensions.get('window').height;
  const modalHeight = windowHeight * 0.6;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const displacementThreshold = 50;
        const velocityThreshold = 1.5;
        if (
          gestureState.dy > displacementThreshold ||
          gestureState.vy > velocityThreshold
        ) {
          Animated.timing(slideAnim, {
            toValue: modalHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.staticOverlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={{ flex: 1 }}>
            <View {...panResponder.panHandlers}>
              <View style={styles.gripBar} />
              <Text style={styles.headerContainer}>コメント</Text>
            </View>
            <View style={styles.commentsContainer}>
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <Image
                      source={
                        item.user.iconImageUrl
                          ? { uri: item.user.iconImageUrl }
                          : require('@/assets/images/profile.png')
                      }
                      style={styles.avatar}
                    />
                    <View style={styles.commentContent}>
                      <Text style={styles.userName}>{item.user.name}</Text>
                      <Text style={styles.commentText}>{item.content}</Text>
                    </View>
                  </View>
                )}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </View>

            <View style={styles.inputContainer}>
              <CommentInput
                postId={postId}
                queryKey={queryKey}
                onNewComment={onNewComment}
              />
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  staticOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gripBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  modal: {
    backgroundColor: '#fff',
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  commentsContainer: {
    flex: 1,
  },
  inputContainer: {
    paddingTop: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    color: '#333',
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CommentsModal;
