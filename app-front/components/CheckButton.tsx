import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  testID?: string;
};

export const CheckButton = ({
  checked,
  onToggle,
  size = 24,
  testID,
}: Props) => {
  const radius = size / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (checked) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      progress.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <TouchableOpacity onPress={onToggle} testID={testID}>
      <View style={[styles.wrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* 背景円 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ccc"
            strokeWidth={2}
            fill="none"
          />
          {/* アニメーション円 */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="green"
            strokeWidth={2}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        {/* ✓ アイコン */}
        {checked && (
          <Ionicons
            name="checkmark"
            size={size * 0.65}
            color="white"
            style={styles.iconOverlay}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOverlay: {
    position: 'absolute',
  },
});
