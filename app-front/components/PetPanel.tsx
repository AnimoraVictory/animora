import { reverseSpeciesMap } from '@/constants/petSpecies';
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import z from 'zod';

export const petSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  species: z.string().min(1),
  birthDay: z.string().min(1)
});

type Pet = z.infer<typeof petSchema>;

type PetPanelProps = {
  pet: Pet;
};

const birthDayParser = (birthDay: string) => {
  const [year, month, day] = birthDay.split('-');
  return `${year}年${month}月${day}日`;
};

export const PetPanel: React.FC<PetPanelProps> = ({ pet }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    Alert.alert(
      '削除の確認',
      '本当に削除してよろしいですか？',
      [
        {
          text: 'キャンセル',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: '削除',
          onPress: async () => {
            try {
              // axiosを使用してDELETEリクエストを送信
              const response = await axios.delete(`http://localhost:3000/pets/delete`, {
                params: { petId: pet.id }
              });
              if (response.status === 200) {
                // queryKey: ["pets"] のキャッシュを無効化して最新状態に更新
                queryClient.invalidateQueries({ queryKey: ["pets"] });
              } else {
                throw new Error("削除に失敗しました");
              }
            } catch (error) {
              console.error(error);
              Alert.alert('エラー', '削除に失敗しました');
            }
          }
        }
      ],
      { cancelable: true }
    );
    setMenuVisible(false);
  };

  const handleEdit = () => {
    // 編集処理の実装（例: 編集画面への遷移など）
    console.log('編集が選択されました');
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsFullScreenVisible(true)}>
        <Image source={{ uri: pet.imageUrl }} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.species}>{reverseSpeciesMap[pet.type][pet.species]}</Text>
        <Text style={styles.birthDay}>{birthDayParser(pet.birthDay)}</Text>
      </View>
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(!menuVisible)}>
        <Text style={styles.menuButtonText}>⋮</Text>
      </TouchableOpacity>
      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
              <Text>削除</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} style={styles.menuItem}>
              <Text>編集</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      <Modal visible={isFullScreenVisible} transparent={true}>
        <TouchableOpacity style={styles.fullScreenOverlay} onPress={() => setIsFullScreenVisible(false)}>
          <Image source={{ uri: pet.imageUrl }} style={styles.fullScreenImage} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    height: 200,
    borderRadius: 25,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    position: 'relative'
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent'
  },
  info: {
    marginLeft: 50,
    flex: 1
  },
  name: {
    paddingBottom: 10,
    fontSize: 24,
    fontWeight: 'bold'
  },
  species: {
    fontSize: 16,
    color: '#666'
  },
  birthDay: {
    paddingTop: 5,
    fontSize: 16,
    color: '#666'
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 90
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 10,
    width: 60,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 100
  },
  menuItem: {
    padding: 10
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  }
});

export default PetPanel;
