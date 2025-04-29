import { TaskType, taskTypeMap } from '@/app/(tabs)/camera';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  useColorScheme,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { DailyTask } from '@/features/dailytask/schema';

type DailyTaskPopUpProps = {
  dailyTask: DailyTask | undefined;
};

const _DailyTaskPopUp: React.FC<DailyTaskPopUpProps> = ({ dailyTask }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const bgColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.card, 'rgba(255, 255, 255, 0.6)'], // 例えば暗→明
  });
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: colors.tint,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          router.replace('/camera');
        }}
      >
        <Text style={styles.title}>🎯 今日のタスク</Text>
        <Text style={styles.content}>
          {`「${taskTypeMap[dailyTask?.type as TaskType]}」\nを達成しよう！`}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const DailyTaskPopUp = React.memo(_DailyTaskPopUp);
export default DailyTaskPopUp;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: 240,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    fontWeight: '500',
  },
});
