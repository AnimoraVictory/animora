import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { User } from '@/constants/api';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { z } from 'zod';
import { Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useForm, Controller } from "react-hook-form";

type CommentInputProps = {
  currentUser: User | null | undefined;
  postId: string;
  onClose: () => void;
};
const API_URL = Constants.expoConfig?.extra?.API_URL;

const CommentInput: React.FC<CommentInputProps> = ({ currentUser, postId, onClose }) => {
  const { control, handleSubmit, reset } = useForm<{ content: string }>({
    defaultValues: { content: "" },
  });

  const onSubmit = (data: { content: string }) => {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("userId", currentUser?.id ?? "");
    formData.append("postId", postId);

    axios
      .post(`${API_URL}/comments/new`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        Alert.alert("投稿完了", "投稿が完了しました！");
        reset(); // 入力欄をリセット
        onClose();
        router.replace("/(tabs)/posts");
      })
      .catch(() => {
        Alert.alert("エラー", "投稿に失敗しました。");
      });
  };

  return (
    <View style={styles.container}>
      {currentUser && (
        <Image source={{ uri: currentUser.iconImageUrl }} style={styles.avatar} />
      )}
      <Controller
        control={control}
        name="content"
        rules={{ required: true, minLength: 1 }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="コメントを入力..."
            value={value}
            onChangeText={onChange}
            multiline
          />
        )}
      />
      <TouchableOpacity onPress={handleSubmit(onSubmit)} style={[styles.button, { backgroundColor: Colors.light.tint }]}>
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
  scrollContainer: {
    flex: 1,
  },
  inputWrapper: {
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
