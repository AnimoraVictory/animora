import React, { useRef, useState, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet,
    PanResponder,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Constants from 'expo-constants';
import { User, UserBase } from '@/constants/api';
import { UserPostList } from './UserPostList';
import { UserPetList } from './UserPetsList';
import { ProfileTabSelector } from './ProfileTabSelector';
import UserProfileHeader from './UserProfileHeader';
import UsersModal from './UsersModal';
import { useModalStack } from '@/providers/ModalStackContext';

const { width } = Dimensions.get('window');
const API_URL = Constants.expoConfig?.extra?.API_URL;

type UserProfileProps = {
    email: string;
    visible: boolean;
    onClose: () => void;
    slideAnim: Animated.Value;
    currentUser: UserBase;
    prevModalIdx: number
};

const UserProfileModal: React.FC<UserProfileProps> = ({
    email,
    visible,
    onClose,
    slideAnim,
    currentUser,
    prevModalIdx,
}) => {
    const [selectedTab, setSelectedTab] = useState<"posts" | "mypet">("posts");
    const [selectedFollowTab, setSelectedFollowTab] = useState<"follows" | "followers">("follows");
    const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);
    const slideAnimFollow = useRef(new Animated.Value(width)).current;
    const queryClient = useQueryClient();
    const { push, pop, isTop } = useModalStack();
    const modalKey: string = `${prevModalIdx + 1}`;
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
    const backgroundColor = colorScheme === 'light' ? 'white' : 'black';

    const { data: user, isLoading, refetch, isRefetching } = useQuery<User>({
        queryKey: ['userProfile', email],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/users/?email=${email}`);
            return res.data.user;
        },
        enabled: visible,
    });

    const isFollowing = useMemo(() => {
        if (!user) return false;
        return user.followers.some((follower) => follower.id === currentUser.id);
      }, [user?.followers, currentUser?.id]);

    const onOpenFollowModal = () => {
        setIsFollowModalVisible(true);
        push(`${prevModalIdx + 2}`)
        Animated.timing(slideAnimFollow, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const onCloseFollowModal = () => {
        Animated.timing(slideAnimFollow, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsFollowModalVisible(false)
            pop()
        });
    };

    const followMutation = useMutation({
        mutationFn: () => {
            return axios.post(`${API_URL}/users/follow?toId=${user?.id}&fromId=${currentUser?.id ?? ""}`);
        },
        onSuccess: () => {
            queryClient.setQueryData(['userProfile', email], (prev: User | undefined) => {
                if (!prev || !currentUser) return prev;
                return {
                    ...prev,
                    followers: [...prev.followers, currentUser],
                    followersCount: prev.followersCount + 1,
                };
            });
            refetch();
        },
        onError: (error) => {
            console.error("フォローエラー", error);
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: () => {
            return axios.delete(`${API_URL}/users/unfollow?toId=${user?.id}&fromId=${currentUser?.id ?? ""}`);
        },
        onSuccess: () => {
            queryClient.setQueryData(['userProfile', email], (prev: User | undefined) => {
                if (!prev || !currentUser) return prev;
                return {
                    ...prev,
                    followers: prev.followers.filter((f) => f.id !== currentUser.id),
                    followersCount: prev.followersCount - 1,
                };
            });
            refetch();
        },
        onError: (error) => {
            console.error("アンフォローエラー", error);
        },
    });

    const handlePressFollowButton = () => {
        if (isFollowing) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    const isMe = currentUser.id === user?.id;

    if (!user || isLoading) return null;

    const headerContent = (
        <View style={{ backgroundColor }}>
            <UserProfileHeader
                isMe={isMe}
                user={user}
                onPressFollow={handlePressFollowButton}
                onOpenFollowModal={onOpenFollowModal}
                setSelectedTab={setSelectedFollowTab}
                isFollowing={isFollowing}
            />
            <ProfileTabSelector
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
            />
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View
                style={[styles.overlay, { transform: [{ translateX: slideAnim }] }]}
                {...panResponder.panHandlers}
            >
                <View style={[styles.topHeader, { backgroundColor: colors.background }]}>
                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <Text style={styles.backText}>＜</Text>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.tint }]}> {user.name} </Text>
                </View>

                <View style={[styles.container, { backgroundColor: colors.middleBackground }]}>
                    <View style={{ marginTop: 80, flex: 1 }}>
                        {selectedTab === "posts" ? (
                            <UserPostList posts={user.posts} colorScheme={colorScheme} onRefresh={refetch} refreshing={isRefetching} headerComponent={headerContent} />
                        ) : (
                            <UserPetList pets={user.pets} colorScheme={colorScheme} onRefresh={refetch} refreshing={isRefetching} headerComponent={headerContent} />
                        )}
                    </View>
                </View>
            </Animated.View>
            <UsersModal
                prevModalIdx={prevModalIdx + 1}
                key={user.id}
                visible={isFollowModalVisible}
                user={user}
                currentUser={currentUser}
                onClose={onCloseFollowModal}
                users={selectedFollowTab === "followers" ? user.followers : user.follows}
                selectedTab={selectedFollowTab}
                setSelectedTab={setSelectedFollowTab}
                slideAnim={slideAnimFollow}
            />
        </Modal>
    );
};

export default UserProfileModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    topHeader: {
        position: 'absolute',
        top: 0,
        height: 80,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
        zIndex: 2,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 44,
    },
    backText: {
        fontSize: 20,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    bioText: {
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 8,
    },
    followButton: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 6,
        marginTop: 10,
    },
    followButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
