import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import UserProfileModal from './UserProfileModal';
import { useModalStack } from '@/providers/ModalStackContext';
import { Like } from '@/features/like/schema';

const { width } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  likes: Like[];
  slideAnim: Animated.Value;
  prevModalIdx: number;
};

const LikedUserModal: React.FC<Props> = ({
  visible,
  onClose,
  likes,
  slideAnim,
  prevModalIdx,
}) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null
  );
  const slideAnimProfile = useRef(new Animated.Value(width)).current;
  const { push, pop } = useModalStack();

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

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: colors.middleBackground }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backText}>＜</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.tint }]}>いいねしたユーザー</Text>
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
      </View>

      {selectedUserEmail && (
        <UserProfileModal
          prevModalIdx={prevModalIdx + 1}
          key={selectedUserEmail}
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
