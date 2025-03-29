import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Animated,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  theme: {
    background: string;
    text: string;
    tint: string;
    icon: string;
  };
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  theme,
  error,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const animRef = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(animRef, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(animRef, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start(() => setFocused(false));
    } else {
      setFocused(false);
    }
  };

  const labelStyle = {
    position: "absolute" as const,
    left: 12,
    top: animRef.interpolate({ inputRange: [0, 1], outputRange: [10, -10] }),
    fontSize: animRef.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: animRef.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.icon, "#2ecc71"],
    }),
    backgroundColor: theme.background,
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: focused ? "#2ecc71" : theme.tint,
          },
        ]}
        placeholder=""
        placeholderTextColor={theme.icon}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginTop: 4,
    marginLeft: 4,
  },
});
