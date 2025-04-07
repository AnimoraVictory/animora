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
import { User } from '@/constants/api';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

type CommentInputProps = {
  currentUser: User | null | undefined;
  postId: string;
  onClose: () => void;
};

const API_URL = Constants.expoConfig?.extra?.API_URL;

const CommentInput: React.FC<CommentInputProps> = ({ currentUser, postId, onClose }) => {
  const [content, setContent] = useState('');
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'light' ? Colors.light : Colors.dark;

  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('userId', currentUser?.id ?? '');
      formData.append('postId', postId);

      return axios.post(`${API_URL}/comments/new`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      Alert.alert('コメント完了', 'コメントを追加しました！');
      setContent('');
      onClose();
      router.replace('/(tabs)/posts');
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
        <Image source={{ uri: currentUser.iconImageUrl }} style={styles.avatar} />
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
