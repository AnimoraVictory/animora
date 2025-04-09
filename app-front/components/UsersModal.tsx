import React from 'react';
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

type Props = {
    currentUser: UserBase;
    visible: boolean;
    onClose: () => void;
    users: UserBase[];
    selectedTab: 'follows' | 'followers';
    setSelectedTab: (tab: 'follows' | 'followers') => void;
    slideAnim: Animated.Value
};

const { width, height } = Dimensions.get('window');

const UsersModal: React.FC<Props> = ({ currentUser, visible, onClose, users, selectedTab, setSelectedTab, slideAnim }) => {
    const [isUserModalVisible, setIsUserModalVisible] = React.useState(false);
    const slideAnimUser = React.useRef(new Animated.Value(Dimensions.get("window").width)).current;
    const openUserProfile = () => {
        setIsUserModalVisible(true);
        Animated.timing(slideAnimUser, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeUserProfile = () => {
        Animated.timing(slideAnimUser, {
            toValue: Dimensions.get("window").width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setIsUserModalVisible(false));
    };

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return false
            },
            onMoveShouldSetPanResponder: (_, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > 1 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                return isHorizontalSwipe && gestureState.dx > 1;
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
    ).current;

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];


    React.useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View style={[styles.overlay, { transform: [{ translateX: slideAnim }] }]} {...panResponder.panHandlers}>
                <Animated.View style={[styles.topHeader, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => onClose()}
                    >
                        <Text style={styles.backText}>＜</Text>
                    </TouchableOpacity>

                    <Text style={[styles.headerUserName, { color: colors.tint }]}>{currentUser.name}</Text>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        { backgroundColor: colors.background, paddingTop: 80 },
                    ]}
                >
                    <View style={styles.tabHeader}>
                        <TouchableOpacity
                            onPress={() => setSelectedTab('follows')}
                            style={[
                                styles.tabButton,
                                selectedTab === 'follows' && { borderBottomColor: colors.tint },
                            ]}
                        >
                            <Text style={[styles.tabText, selectedTab === 'follows' && styles.activeTabText, { color: colors.tint }]}>
                                フォロー中
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSelectedTab('followers')}
                            style={[
                                styles.tabButton,
                                selectedTab === 'followers' && { borderBottomColor: colors.tint }
                            ]}
                        >
                            <Text style={[styles.tabText, selectedTab === 'followers' && styles.activeTabText, { color: colors.tint }]}>
                                フォロワー
                            </Text>
                        </TouchableOpacity>
                    </View>


                    <FlatList
                        data={users}
                        style={
                            { backgroundColor: colors.middleBackground }
                        }
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.userItem} onPress={openUserProfile}>
                                <Image source={{ uri: item.iconImageUrl }} style={styles.avatar} />
                                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                                <UserProfileModal
                                    key={item.id}
                                    email={item.email}
                                    visible={isUserModalVisible}
                                    onClose={closeUserProfile}
                                    slideAnim={slideAnimUser}
                                ></UserProfileModal>
                            </TouchableOpacity>
                        )}
                    />
                </Animated.View>
            </Animated.View>
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
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
