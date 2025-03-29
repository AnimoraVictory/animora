import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const icon =
    colorScheme === "light"
      ? require("../../assets/images/icon-green.png")
      : require("../../assets/images/icon-dark.png");

  return (
    <ImageBackground
      /* The line `// source={require("../../assets/images/noise.png")}` is a commented-out line of code in
the `ImageBackground` component. It appears to be attempting to set the background image of the
`ImageBackground` component to an image file located at `"../../assets/images/noise.png"`. */
      source={require("../../assets/images/noise2.png")}
      resizeMode="repeat"
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={[styles.title, { color: theme.text }]}>
        Animaliaへようこそ!
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.tint }]}
          onPress={() => router.push("/(auth)/signin")}
        >
          <Text style={[styles.buttonText, { color: theme.tint }]}>
            ログイン
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: theme.tint }]}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={[styles.buttonText, { color: theme.tint }]}>
            新規ユーザー登録
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: "60%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});
