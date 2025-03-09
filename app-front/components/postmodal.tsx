import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

const { height } = Dimensions.get('window');

export interface PostModalProps {
  visible: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ visible, onClose }) => {
  // 外部からの visible によってモーダル自体の表示/非表示を管理
  const [showModal, setShowModal] = useState(visible);
  // アニメーション用の値。初期値は下部に配置
  const slideAnim = useRef(new Animated.Value(height * 0.8)).current;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  // 開くアニメーションの関数
  const openAnimation = () => {
    // 初期位置にセット
    slideAnim.setValue(height * 0.8);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // 閉じるアニメーションの関数
  const closeAnimation = () => {
    Animated.timing(slideAnim, {
      toValue: height * 0.8,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // アニメーション完了後に内部状態を false にし、onClose を呼ぶ
      setShowModal(false);
      onClose();
    });
  };

  // visible が true でかつ内部状態が false の場合は表示状態に切り替え、アニメーション開始
  if (visible && !showModal) {
    setShowModal(true);
  }

  // visible が true なら onLayout で開くアニメーションをトリガー
  const handleLayout = () => {
    if (visible) {
      openAnimation();
    }
  };

  // モーダルが完全に非表示の場合はレンダリングしない
  if (!visible && !showModal) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.modalContent,
        { transform: [{ translateY: slideAnim }] },
      ]}
      onLayout={handleLayout}
    >
      <TouchableOpacity style={styles.closeButton} onPress={closeAnimation}>
        <Text style={{ color: colors.tint }}>キャンセル</Text>
      </TouchableOpacity>
      <ThemedText style={styles.modalTitle}>投稿を作成</ThemedText>
      {/* ここに投稿フォームなどのコンポーネントを配置 */}
    </Animated.View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    modalContent: {
      height: height * 0.8, // 画面の80%の高さ
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: colors.background,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    closeButton: {
      marginTop: 20,
      alignSelf: 'flex-end',
    },
  });

export default PostModal;
