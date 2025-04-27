import { Colors } from '@/constants/Colors';
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';

export type PostTabType = 'recommended' | 'follows';

type PostTabSelectorProps = {
  selectedTab: PostTabType;
  onSelectTab: (tab: PostTabType) => void;
};

export const PostTabSelector: React.FC<PostTabSelectorProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = colorScheme === 'light' ? 'white' : 'black';
  const styles = getStyles(colors);

  return (
    <View style={[styles.tabContainer, { backgroundColor }]}>
      <TouchableOpacity
        onPress={() => onSelectTab('recommended')}
        style={[
          styles.tabButton,
          selectedTab === 'recommended' && styles.tabButtonActive,
        ]}
      >
        <Text style={styles.tabText}>おすすめ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSelectTab('follows')}
        style={[
          styles.tabButton,
          selectedTab === 'follows' && styles.tabButtonActive,
        ]}
      >
        <Text style={styles.tabText}>フォロー中</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    tabContainer: {
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      borderColor: colors.icon,
    },
    tabButton: {
      width: '50%',
      paddingVertical: 15,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    tabButtonActive: {
      borderBottomWidth: 2,
      borderColor: colors.tint,
    },
    tabText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
  });
