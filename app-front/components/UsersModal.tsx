import React, { useRef, useState, useEffect, useMemo } from 'react';
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
import { UserBase } from '@/constants/api';
import UserProfileModal from './UserProfileModal';
import { useModalStack } from '@/providers/ModalStackContext';

const { width, height } = Dimensions.get('window');

type Props = {
    user: UserBase;
    visible: boolean;
    onClose: () => void;
    users: UserBase[];
    selectedTab: 'follows' | 'followers';
    setSelectedTab: (tab: 'follows' | 'followers') => void;
    slideAnim: Animated.Value;
    prevModalIdx: number
    currentUser: UserBase
};

const UsersModal: React.FC<Props> = ({
    user,
    visible,
    onClose,
    users,
    selectedTab,
    setSelectedTab,
    slideAnim,
    prevModalIdx,
    currentUser
}) => {
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
    const slideAnimProfile = useRef(new Animated.Value(width)).current;
    const { push, pop, isTop } = useModalStack();
    const modalKey = `${prevModalIdx + 1}`;


    const openUserProfile = (email: string) => {
        setSelectedUserEmail(email);
        setIsProfileModalVisible(true);
        push(`${prevModalIdx + 2}`)
        Animated.timing(slideAnimProfile, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeUserProfile = () => {
        Animated.timing(slideAnimProfile, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsProfileModalVisible(false)
            pop()
        });
    };

    const panResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > 1 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                return isHorizontalSwipe && gestureState.dx > 1 && isTop(modalKey);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx > 0) {
                    slideAnim.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 100) {
                    Animated.timing(slideAnim, {
                        toValue: width,
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
        })
        , [modalKey, isTop, slideAnim, onClose]);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View style={[styles.overlay, { transform: [{ translateX: slideAnim }] }]} {...panResponder.panHandlers}>
                <Animated.View style={[styles.topHeader, { backgroundColor: colors.background }]}>
                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <Text style={styles.backText}>＜</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerUserName, { color: colors.tint }]}>{user.name}</Text>
                </Animated.View>
                <Animated.View style={[styles.modalContainer, { backgroundColor: colors.background, paddingTop: 80 }]}>
                    <View style={styles.tabHeader}>
                        <TouchableOpacity
                            onPress={() => setSelectedTab('follows')}
                            style={[styles.tabButton, selectedTab === 'follows' && { borderBottomColor: colors.tint }]}
                        >
                            <Text style={[styles.tabText, selectedTab === 'follows' && styles.activeTabText, { color: colors.tint }]}>フォロー中</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSelectedTab('followers')}
                            style={[styles.tabButton, selectedTab === 'followers' && { borderBottomColor: colors.tint }]}
                        >
                            <Text style={[styles.tabText, selectedTab === 'followers' && styles.activeTabText, { color: colors.tint }]}>フォロワー</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={users}
                        style={{ backgroundColor: colors.middleBackground }}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.userItem} onPress={() => openUserProfile(item.email)}>
                                <Image source={{ uri: item.iconImageUrl }} style={styles.avatar} />
                                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </Animated.View>
            </Animated.View>
            {selectedUserEmail && (
                <UserProfileModal
                    prevModalIdx={prevModalIdx + 1}
                    key={prevModalIdx +1}
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

export default UsersModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    headerUserName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    topHeader: {
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
    tabHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        marginHorizontal: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        fontWeight: 'bold',
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: width,
        height: height,
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