import React, { useRef, useState, useMemo } from 'react';
import {
  Modal,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import UserProfileModal from './UserProfileModal';
import { useModalStack } from '@/providers/ModalStackContext';
import { Like } from '@/features/like/schema';
import { UserBase } from '@/features/user/schema';

const { width, height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  likes: Like[];
  slideAnim: Animated.Value;
  prevModalIdx: number;
  currentUser: UserBase;
};

const LikedUserModal: React.FC<Props> = ({
  visible,
  onClose,
  likes,
  slideAnim,
  prevModalIdx,
  currentUser,
}) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null
  );
  const slideAnimProfile = useRef(new Animated.Value(width)).current;
  const { push, pop, isTop } = useModalStack();
  const modalKey = `${prevModalIdx + 1}`;

  const openUserProfile = (email: string) => {
    setSelectedUserEmail(email);
    setIsProfileModalVisible(true);
    push(`${prevModalIdx + 2}`);
    Animated.timing(slideAnimProfile, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeUserProfile = () => {
    Animated.timing(slideAnimProfile, {
      toValue: width,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsProfileModalVisible(false);
      pop();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const isVerticalSwipe =
            Math.abs(gestureState.dy) > 1 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
          return isVerticalSwipe && gestureState.dy > 1 && isTop(modalKey);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            slideAnim.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 100) {
            Animated.timing(slideAnim, {
              toValue: height,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onClose());
          } else {
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [modalKey, isTop, slideAnim, onClose]
  );
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.middleBackground,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backText}>＜</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.tint }]}>
            いいねしたユーザー
          </Text>
        </View>
        <FlatList
          data={likes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: 80,
            backgroundColor: colors.middleBackground,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => openUserProfile(item.user.email)}
            >
              <Image
                source={
                  item.user.iconImageUrl
                    ? { uri: item.user.iconImageUrl }
                    : require('@/assets/images/profile.png')
                }
                style={styles.avatar}
              />
              <Text style={[styles.userName, { color: colors.text }]}>
                {item.user.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {selectedUserEmail && (
        <UserProfileModal
          prevModalIdx={prevModalIdx + 1}
          key={selectedUserEmail}
          currentUser={currentUser}
          email={selectedUserEmail}
          visible={isProfileModalVisible}
          onClose={closeUserProfile}
          slideAnim={slideAnimProfile}
        />
      )}
    </Modal>
  );
};

export default LikedUserModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    paddingTop: 40,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 44,
    zIndex: 1,
  },
  backText: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
