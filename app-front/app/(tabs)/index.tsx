import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/providers/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  FlatList,
  Modal,
} from 'react-native';
import z from 'zod';
import { postSchema } from './posts';
import { Colors } from '@/constants/Colors';
import PostModal from '../../components/postmodal';
import { router } from 'expo-router';

type TabType = 'posts' | 'mypet';

// ペットのスキーマ定義
const petSchema = z.object({
  id: z.string().uuid(),
  imageURL: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
});

// バックエンドのレスポンス用スキーマ
const getPetResponseSchema = z.object({
  pets: z.array(petSchema),
});

// 投稿のレスポンス用スキーマ
const getPostResponseSchema = z.object({
  posts: z.array(postSchema),
});

type Pet = z.infer<typeof petSchema>;
type Post = z.infer<typeof postSchema>;

const ProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [selectedTab, setSelectedTab] = useState<TabType>('posts');
  const { user, loading: authLoading, logout } = useAuth();
  console.log(user)
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
    router.replace('/(auth)');
  }

  // モーダル表示状態の管理
  const [modalVisible, setModalVisible] = useState(false);

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ペット情報を取得
  const { data: petData, isLoading: petLoading, error: petError } = useQuery<Pet[]>({
    queryKey: ['pets', user.id],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/pets/owner', {
        params: { ownerId: user.id },
      });
      const parsedResponse = getPetResponseSchema.parse(response.data);
      return parsedResponse.pets;
    },
    enabled: !!user.id,
  });

  // ユーザーの投稿一覧を取得
  const { data: postData, isLoading: postLoading, error: postError } = useQuery<Post[]>({
    queryKey: ['posts', user.id],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/posts/user', {
        params: { authorId: user.id },
      });
      const parsedResponse = getPostResponseSchema.parse(response.data);
      return parsedResponse.posts;
    },
    enabled: !!user.id,
  });
  const ListHeader = () => (
    <View>
      {/* プロフィール上部セクション */}
      <TouchableOpacity style={styles.editButton} onPress={() => handleLogout()}>
        <Text style={{ color: colors.tint }}>編集</Text>
      </TouchableOpacity>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://example.com/profile.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileBio}>ここに自己紹介文を記載</Text>
      </View>

      {/* タブ選択セクション */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setSelectedTab('posts')}
          style={[styles.tabButton, selectedTab === 'posts' && styles.tabButtonActive]}
        >
          <Text style={styles.tabText}>投稿一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('mypet')}
          style={[styles.tabButton, selectedTab === 'mypet' && styles.tabButtonActive]}
        >
          <Text style={styles.tabText}>マイペット</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // タブに応じたレンダリング内容
  const renderItem = ({ item }: { item: any }) => {
    if (selectedTab === 'mypet') {
      return (
        <ThemedView style={styles.petContainer}>
          <Image source={{ uri: item.imageURL }} style={styles.petImage} />
          <View style={styles.petInfo}>
            <ThemedText style={styles.petName}>{item.name}</ThemedText>
            <ThemedText style={styles.petType}>{item.type}</ThemedText>
          </View>
        </ThemedView>
      );
    } else {
      return (
        <ThemedView style={styles.postContainer}>
          <ThemedText style={styles.postTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.postContent}>{item.content}</ThemedText>
        </ThemedView>
      );
    }
  };

  const listData = selectedTab === 'mypet' ? petData : postData;
  const isDataLoading = selectedTab === 'mypet' ? petLoading : postLoading;
  const isDataError = selectedTab === 'mypet' ? petError : postError;

  return (
    <>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          isDataLoading ? (
            <Text>読み込み中...</Text>
          ) : isDataError ? (
            <Text>エラーが発生しました</Text>
          ) : (
            <Text style={styles.emptyText}>
              {selectedTab === 'mypet' ? 'マイペットを登録しましょう！' : '投稿しましょう！'}
            </Text>
          )
        }
      />
      {/* 右下に配置する+ボタン */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      {/* 投稿作成用モーダル */}
      <Modal visible={modalVisible} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <PostModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        </View>
      </Modal>
    </>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    editButton: {
      alignSelf: 'flex-end',
      position: 'fixed',
      borderRadius: 10,
      paddingTop: 50,
      paddingRight: 20,
    },
    profileHeader: {
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderColor: colors.icon,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 50,
    },
    profileName: {
      marginTop: 10,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    profileBio: {
      marginTop: 5,
      fontSize: 14,
      color: colors.icon,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderColor: colors.icon,
    },
    tabButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    tabButtonActive: {
      borderBottomWidth: 2,
      borderColor: colors.tint,
    },
    tabText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    contentContainer: {
      padding: 20,
      backgroundColor: colors.background,
    },
    petContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: colors.icon,
    },
    petImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 10,
    },
    petInfo: {
      flex: 1,
    },
    petName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    petType: {
      fontSize: 14,
      color: colors.icon,
    },
    postContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.icon,
      paddingHorizontal: 10,
    },
    postTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.text,
    },
    postContent: {
      fontSize: 14,
      color: colors.text,
    },
    fab: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      backgroundColor: colors.tint,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    fabText: {
      color: colors.background,
      fontSize: 30,
      lineHeight: 30,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    emptyText: {
      padding: 20,
      fontSize: 16,
      color: colors.text,
    },
  });

export default ProfileScreen;
