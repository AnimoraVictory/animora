import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.6;

type SideMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const translateX = useSharedValue(isOpen ? 0 : -MENU_WIDTH);

  React.useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -MENU_WIDTH, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.menuContent}>
          <TouchableOpacity
            onPress={() => {
              onClose();
              router.replace('/(setting)');
            }}
          >
            <Text style={styles.menuItem}>設定</Text>
          </TouchableOpacity>

          <Text style={styles.menuItem}>ヘルプ</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.menuItem}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: screenWidth * 0.4,
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: 'white',
    zIndex: 9999,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuContent: {
    paddingHorizontal: 20,
  },
  menuItem: {
    color: '#333',
    fontSize: 16,
    paddingVertical: 16,
  },
});
