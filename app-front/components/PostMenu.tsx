import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const PostMenu: React.FC<Props> = ({ visible, onClose, onReport }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const modalHeight = SCREEN_HEIGHT * 0.25;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const displacementThreshold = 50;
        const velocityThreshold = 1.5;
        if (
          gestureState.dy > displacementThreshold ||
          gestureState.vy > velocityThreshold
        ) {
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(modalHeight); // 初期値を設定
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.modal,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <TouchableOpacity style={styles.menuItem} onPress={onReport}>
          <Text style={styles.menuText}>通報する</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={onClose}>
          <Text style={[styles.menuText, { color: 'gray' }]}>キャンセル</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default PostMenu;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modal: {
    position: 'absolute',
    width: '95%',
    bottom: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignSelf: 'center', // 中央に配置
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginBottom: 12,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
