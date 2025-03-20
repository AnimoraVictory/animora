import React from 'react';
import { Modal, Animated, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { z } from 'zod';

type ProfileEditModalProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
};

const profileEditInputSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  bio: z.string().min(1, { message: '自己紹介を入力してください' }),
})

type ProfileEditInput = z.infer<typeof profileEditInputSchema>;

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ visible, onClose, slideAnim }) => {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'light' ? Colors.light : Colors.dark;

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }], backgroundColor: colors.background },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={{ color: colors.tint }}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>プロフィール編集</Text>
          {/* 編集フォームなどをここに配置 */}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: 20,
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    padding: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 60,
    textAlign: 'center',
  },
});
