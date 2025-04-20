import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/constants/Colors';
import { Comment } from './CommentsModal';
import { fetchApi } from '@/utils/api';
import { commentSchema } from '@/features/comment/schema';
import { useAuth } from '@/providers/AuthContext';
import { z } from 'zod';

type CommentInputProps = {
  postId: string;
  queryKey: unknown[];
  onNewComment: (comment: Comment) => void;
};

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  queryKey,
  onNewComment,
}) => {
  const { user: currentUser, token } = useAuth();
  const [content, setContent] = useState('');
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'light' ? Colors.light : Colors.dark;

  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('userId', currentUser?.id ?? '');
      formData.append('postId', postId);

      const response = await fetchApi({
        method: 'POST',
        path: '/comments/new',
        schema: z.object({ comment: commentSchema }),
        options: {
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
        token: token,
      });

      return response.comment; // ← ここで新しいコメントを返す
    },
    onSuccess: (createdComment) => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      Alert.alert('コメント完了', 'コメントを追加しました！');
      onNewComment(createdComment);
      setContent('');
    },
    onError: () => {
      Alert.alert('エラー', 'コメントに失敗しました');
    },
  });

  const handleSubmit = () => {
    if (!content || content.trim().length < 1) {
      Alert.alert('エラー', 'コメントは1文字以上必要です。');
      return;
    }
    createCommentMutation.mutate({ content: content.trim() });
  };

  return (
    <View style={styles.container}>
      {currentUser && (
        <Image
          source={
            currentUser.iconImageUrl
              ? { uri: currentUser.iconImageUrl }
              : require('@/assets/images/profile.png')
          }
          style={styles.avatar}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="コメントを入力..."
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.button, { backgroundColor: colors.background }]}
        disabled={createCommentMutation.isPending}
      >
        <Text style={styles.buttonText}>送信</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  button: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
  },
});

export default CommentInput;
