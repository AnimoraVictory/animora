import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { User } from '@/constants/api';

type UserProfileHeaderProps = {
    user: User;
    onPressFollow: () => void;
    onOpenFollowModal: () => void;
    setSelectedTab: (tab: 'follows' | 'followers') => void;
    isFollowing: boolean;
};

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
    user,
    onPressFollow,
    onOpenFollowModal,
    setSelectedTab,
    isFollowing,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const backgroundColor = colorScheme === 'light' ? 'white' : 'black';

    const handleOpenFollowModal = (tab: 'follows' | 'followers') => {
        setSelectedTab(tab);
        onOpenFollowModal();
    };


    return (
        <View style={[styles.headerContainer, { backgroundColor }]}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileBio}>{user.bio}</Text>

            <View style={styles.row}>
                <Image source={{ uri: user.iconImageUrl }} style={styles.profileImage} />

                <View style={styles.rightBox}>
                    <View style={styles.followRow}>
                        <TouchableOpacity style={styles.followBox} onPress={() => handleOpenFollowModal("follows")}>
                            <Text style={styles.followCount}>{user.followsCount}</Text>
                            <Text style={styles.followLabel}>フォロー</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.followBox} onPress={() => handleOpenFollowModal("followers")}>
                            <Text style={styles.followCount}>{user.followersCount}</Text>
                            <Text style={styles.followLabel}>フォロワー</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.followButton, { borderColor: colors.tint,backgroundColor: isFollowing ? colors.background : colors.middleBackground }]} onPress={onPressFollow}>
                        <Text style={[styles.followButtonText, { color: colors.tint}]}>
                            {isFollowing ? 'フォロー中' : 'フォロー'}
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
        headerContainer: {
            paddingTop: 16,
            paddingBottom: 16,
            paddingHorizontal: 20,
            alignItems: 'center',
        },
        profileName: {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        profileBio: {
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 12,
        },
        row: {
            flexDirection: 'row',
            gap: 16,
        },
        profileImage: {
            width: 64,
            height: 64,
            borderRadius: 32,
            marginRight: 16,
        },
        rightBox: {
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'column',
        },
        followRow: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        followBox: {
            marginRight: 16,
            alignItems: 'center',
        },
        followCount: {
            fontWeight: 'bold',
            fontSize: 16,
        },
        followLabel: {
            fontSize: 12,
        },
        followButton: {
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingVertical: 6,
            alignSelf: 'flex-start',
        },
        followButtonText: {
            fontSize: 14,
            fontWeight: 'bold',
        },
    });

export default UserProfileHeader;
