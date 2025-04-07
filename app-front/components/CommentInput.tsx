import { User } from '@/constants/api';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState, FormEvent } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';

type CommentInputProps = {
  currentUser: User;
  postId: string;
  onClose: () => void;
};

const CommentInputScema = z.object({
  content: z.string().min(1),
});

type CommentInputForm = z.infer<typeof CommentInputScema>;

const CommentInput: React.FC<CommentInputProps> = ({ currentUser, postId, onClose }) => {
  const [comment, setComment] = useState('');
  const API_URL = Constants.expoConfig?.extra?.API_URL;

  const createPostMutation = useMutation({
    mutationFn: (data: CommentInputForm) => {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('userId', currentUser.id);
      formData.append('postId', postId);

      return axios.post(`${API_URL}/comments/new`, formData, {
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form: CommentInputForm = { content: comment };
    const parseResult = CommentInputScema.safeParse(form);
    if (!parseResult.success) {
      Alert.alert("エラー", "コメントは1文字以上必要です。");
      return;
    }
    createPostMutation.mutate(parseResult.data);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <img
        src={currentUser.iconImageUrl}
        alt="ユーザー画像"
        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px' }}
      />
      <input
        type="text"
        placeholder="コメントを入力..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit">送信</button>
    </form>
  );
};

export default CommentInput;
