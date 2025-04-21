import React from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ColorSchemeName,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import useProfileEditModal from '@/features/user/useProfileEditModal';

type ProfileEditModalProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  colorScheme: ColorSchemeName;
};

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
  slideAnim,
  colorScheme,
}) => {
  const colors = colorScheme === 'light' ? Colors.light : Colors.dark;

  const { formData, onChangeForm, handleSubmit, isPending } =
    useProfileEditModal({
      onClose,
    });

  // 画像選択処理
  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限エラー', 'メディアライブラリへのアクセス許可が必要です');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChangeForm({ key: 'imageUri', value: result.assets[0].uri });
    }
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateX: slideAnim }],
                backgroundColor: colors.background,
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={{ color: colors.tint }}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              プロフィール編集
            </Text>
            <TouchableOpacity
              onPress={pickProfileImage}
              style={styles.iconContainer}
            >
              {formData.imageUri ? (
                <Image
                  source={{ uri: formData.imageUri }}
                  style={styles.iconImage}
                />
              ) : (
                <Text style={[styles.iconPlaceholder, { color: colors.icon }]}>
                  アイコン画像
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.inputTitle}>名前</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.icon, color: colors.text },
              ]}
              placeholder="名前"
              placeholderTextColor={colors.icon}
              value={formData.name}
              onChangeText={(value) => onChangeForm({ key: 'name', value })}
            />
            <Text style={styles.inputTitle}>自己紹介</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.icon, color: colors.text },
              ]}
              placeholder="自己紹介"
              placeholderTextColor={colors.icon}
              value={formData.bio}
              onChangeText={(value) => onChangeForm({ key: 'bio', value })}
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              disabled={isPending}
            >
              <Text style={{ color: colors.background, fontWeight: 'bold' }}>
                更新する
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    padding: 20,
    borderRadius: 10,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    paddingBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    fontSize: 14,
  },
  submitButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default ProfileEditModal;
