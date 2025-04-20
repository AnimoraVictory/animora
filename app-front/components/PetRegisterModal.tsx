import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ColorSchemeName,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { speciesOptions } from '@/constants/petSpecies';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5 } from '@expo/vector-icons';
import usePetRegisterModal from '@/features/pet/usePetRegisterModal';

type PetRegiserModalProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  colorScheme: ColorSchemeName;
  refetchPets: () => void;
};

export const PetRegiserModal: React.FC<PetRegiserModalProps> = ({
  visible,
  onClose,
  slideAnim,
  colorScheme,
  refetchPets,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  const colors = colorScheme === 'light' ? Colors.light : Colors.dark;

  const {
    formData,
    onChangeForm,
    date,
    handleDateChange,
    handleSubmit,
    isPending,
  } = usePetRegisterModal({
    onClose,
    refetchPets,
    onCloseDatePicker,
  });

  // セレクター用のモーダル表示状態
  const [showPetTypeSelector, setShowPetTypeSelector] = useState(false);
  const [showSpeciesSelector, setShowSpeciesSelector] = useState(false);

  const pickIconImage = async () => {
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
      onChangeForm({ key: 'iconImageUri', value: result.assets[0].uri });
    }
  };

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPending) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isPending, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
            {isPending && (
              <View style={styles.loadingOverlay}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <FontAwesome5 name="paw" size={48} color="#fff" />
                </Animated.View>
              </View>
            )}
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={{ color: colors.tint }}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ペットを登録する
            </Text>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={pickIconImage}
            >
              {formData.iconImageUri ? (
                <Image
                  source={{ uri: formData.iconImageUri }}
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
            <Text style={styles.inputTitle}>動物種</Text>
            <TouchableOpacity
              onPress={() => setShowPetTypeSelector(true)}
              style={[styles.selectorInput, { borderColor: colors.icon }]}
            >
              <Text style={{ color: colors.text }}>
                {formData.petType === 'dog' ? '犬' : '猫'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.inputTitle}>品種</Text>
            <TouchableOpacity
              onPress={() => setShowSpeciesSelector(true)}
              style={[styles.selectorInput, { borderColor: colors.icon }]}
            >
              <Text style={{ color: colors.text }}>{formData.species}</Text>
            </TouchableOpacity>
            <Text style={styles.inputTitle}>誕生日</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.selectorInput, { borderColor: colors.icon }]}
            >
              <Text style={{ color: colors.text }}>
                {formData.birthDay || '誕生日を選択'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              disabled={isPending}
            >
              <Text style={{ color: colors.background, fontWeight: 'bold' }}>
                登録する
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Modal transparent visible={showPetTypeSelector} animationType="fade">
            <TouchableOpacity
              style={styles.selectorOverlay}
              onPress={() => setShowPetTypeSelector(false)}
            >
              <View
                style={[
                  styles.selectorContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.selectorTitle, { color: colors.text }]}>
                  種類を選択
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onChangeForm({
                      updates: {
                        petType: 'dog',
                        species: '',
                      },
                    });
                    setShowPetTypeSelector(false);
                  }}
                >
                  <Text style={[styles.selectorItem, { color: colors.text }]}>
                    犬
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onChangeForm({
                      updates: {
                        petType: 'cat',
                        species: '',
                      },
                    });
                    setShowPetTypeSelector(false);
                  }}
                >
                  <Text style={[styles.selectorItem, { color: colors.text }]}>
                    猫
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
          <Modal transparent visible={showSpeciesSelector} animationType="fade">
            <TouchableOpacity
              style={styles.selectorOverlay}
              onPress={() => setShowSpeciesSelector(false)}
            >
              <View
                style={[
                  styles.selectorContainerFixed,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.selectorTitle, { color: colors.text }]}>
                  品種を選択
                </Text>
                <ScrollView>
                  {speciesOptions[formData.petType].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        onChangeForm({
                          updates: {
                            species: s,
                          },
                        });
                        setShowSpeciesSelector(false);
                      }}
                    >
                      <Text
                        style={[styles.selectorItem, { color: colors.text }]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
          {showDatePicker && (
            <Modal transparent animationType="fade">
              <TouchableWithoutFeedback
                onPress={() => setShowDatePicker(false)}
              >
                <View style={styles.selectorOverlay}>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      mode="date"
                      value={date || new Date()}
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={styles.datePicker}
                      locale="ja-JP"
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}
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
    borderRadius: 10,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  selectorInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorContainer: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
  },
  // 固定高さのコンテナ（例: 300px）
  selectorContainerFixed: {
    width: '80%',
    height: 300,
    borderRadius: 10,
    padding: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  selectorItem: {
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
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
  datePickerContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    alignItems: 'center',
  },
  datePicker: {
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // 他要素より前面
  },
});

export default PetRegiserModal;
