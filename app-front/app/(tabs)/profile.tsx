import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  useColorScheme,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/providers/AuthContext';
import { Colors } from '@/constants/Colors';
import { ProfileHeader } from '@/components/ProfileHeader';
import {
  ProfileTabSelector,
  ProfileTabType,
} from '@/components/ProfileTabSelector';
import { router } from 'expo-router';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { PetRegiserModal } from '@/components/PetRegisterModal';
import { UserPetList } from '@/components/UserPetsList';
import { UserPostList } from '@/components/UserPostList';
import UsersModal from '@/components/UsersModal';
import { useModalStack } from '@/providers/ModalStackContext';
import * as Haptics from 'expo-haptics';
import { SideMenu } from '@/components/SideMenu';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);
  const { push, pop } = useModalStack();

  const [selectedTab, setSelectedTab] = useState<ProfileTabType>('posts');
  const [selectedFollowTab, setSelectedFollowTab] = useState<
    'follows' | 'followers'
  >('follows');
  const {
    user,
    isRefetching,
    loading: authLoading,
    logout,
    refetch: refetchUser,
  } = useAuth();

  const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRegisterPetModalVisible, setIsRegisterPetModalVisible] =
    useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const slideAnimProfile = useRef(new Animated.Value(windowWidth)).current;
  const slideAnimPet = useRef(new Animated.Value(windowWidth)).current;
  const slideAnimFollow = useRef(new Animated.Value(windowWidth)).current;
  const backgroundColor = colorScheme === 'light' ? 'white' : 'black';
  const scrollRef = useRef<ScrollView>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });

  const icon =
    colorScheme === 'light'
      ? require('../../assets/images/icon-green.png')
      : require('../../assets/images/icon-dark.png');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
    router.replace('/(auth)');
  };

  const openEditProfileModal = () => {
    setIsEditModalVisible(true);
    Animated.timing(slideAnimProfile, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeEditProfileModal = () => {
    Animated.timing(slideAnimProfile, {
      toValue: windowWidth,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsEditModalVisible(false);
    });
  };

  const openRegisterPetModal = () => {
    setIsRegisterPetModalVisible(true);
    Animated.timing(slideAnimPet, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeRegisterPetModal = () => {
    Animated.timing(slideAnimPet, {
      toValue: windowWidth,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsRegisterPetModalVisible(false);
    });
  };

  const openFollowModal = () => {
    setIsFollowModalVisible(true);
    push('1');
    Animated.timing(slideAnimFollow, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeFollowModal = () => {
    Animated.timing(slideAnimFollow, {
      toValue: windowWidth,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsFollowModalVisible(false);
      pop();
    });
  };

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const onScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / windowWidth);
    setSelectedTab(newIndex === 0 ? 'posts' : 'mypet');
  };

  const headerContent = (
    <View style={{ backgroundColor }}>
      <ProfileHeader
        user={user}
        onLogout={handleLogout}
        onOpenFollowModal={openFollowModal}
        setSelectedTab={setSelectedFollowTab}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <View style={[styles.editButtonsContainer]}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={openEditProfileModal}
        >
          <Text style={styles.buttonText}>プロフィールを編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (user.pets && user.pets.length > 0) {
              Alert.alert('登録上限', '現在ペットの登録は1匹までです');
              return;
            }
            openRegisterPetModal();
          }}
        >
          <Text style={styles.buttonText}>ペットを登録する</Text>
        </TouchableOpacity>
      </View>
      <ProfileTabSelector
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        scrollRef={scrollRef}
      />
    </View>
  );

  const contentList = (
    <Animated.ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            refetchUser();
          }}
          tintColor={colorScheme === 'light' ? 'black' : 'white'}
        />
      }
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      contentInset={{ top: 90 }}
      contentOffset={{ x: 0, y: -90 }}
    >
      <View>
        {headerContent}
        <ScrollView
          horizontal
          pagingEnabled
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={{ minHeight: windowHeight * 0.8 }}
        >
          <View style={{ width: windowWidth }}>
            <UserPostList posts={user.posts} colorScheme={colorScheme} />
          </View>
          <View style={{ width: windowWidth }}>
            <UserPetList pets={user.pets} colorScheme={colorScheme} />
          </View>
        </ScrollView>
      </View>
    </Animated.ScrollView>
  );
  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.topHeader,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <Image source={icon} style={styles.logo} />
      </Animated.View>
      {contentList}
      <ProfileEditModal
        visible={isEditModalVisible}
        onClose={closeEditProfileModal}
        slideAnim={slideAnimProfile}
        colorScheme={colorScheme}
      />
      <PetRegiserModal
        visible={isRegisterPetModalVisible}
        onClose={closeRegisterPetModal}
        slideAnim={slideAnimPet}
        colorScheme={colorScheme}
        refetchPets={refetchUser}
      />
      <UsersModal
        prevModalIdx={0}
        slideAnim={slideAnimFollow}
        user={user}
        visible={isFollowModalVisible}
        onClose={() => closeFollowModal()}
        follows={user.follows}
        followers={user.followers}
        selectedTab={selectedFollowTab}
        setSelectedTab={setSelectedFollowTab}
      />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </ThemedView>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.middleBackground,
    },
    topHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 90,
      zIndex: 10,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.tint,
    },
    logo: {
      width: 32,
      height: 32,
      marginTop: 50,
      resizeMode: 'contain',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 10,
      marginBottom: 10,
    },
    editButton: {
      borderWidth: 1,
      borderColor: colors.icon,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 16,
      width: 160,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.text,
      fontWeight: 'bold',
    },
  });

export default ProfileScreen;
