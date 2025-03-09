import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: Colors[colorScheme ?? "light"].text },
        ]}
      >
        Welcome to the App!
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Sign In"
          onPress={() => router.push("/(auth)/signin")}
          color={Colors[colorScheme ?? "light"].tint}
        />
        <Button
          title="Sign Up"
          onPress={() => router.push("/(auth)/signup")}
          color={Colors[colorScheme ?? "light"].tint}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 16,
  },
});
