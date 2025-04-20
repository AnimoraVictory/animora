import React, { useRef } from "react";
import {
  Image,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
  Pressable,
} from "react-native";

export type ProfilePostPanelProps = {
  imageUrl: string;
  onPress: () => void;
};

const windowWidth = Dimensions.get("window").width;
const imageWidth = windowWidth / 3;
const imageHeight = (imageWidth * 4) / 3;

export const ProfilePostPanel: React.FC<ProfilePostPanelProps> = ({
  imageUrl,
  onPress,
}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const handlePress = (e: GestureResponderEvent) => {
    const dx = Math.abs(e.nativeEvent.pageX - touchStartX.current);
    const dy = Math.abs(e.nativeEvent.pageY - touchStartY.current);
    const swipeThreshold = 10;

    // スワイプではなく純粋なタップと判定されたときだけ実行
    if (dx < swipeThreshold && dy < swipeThreshold) {
      onPress();
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      onTouchStart={(e) => {
        touchStartX.current = e.nativeEvent.pageX;
        touchStartY.current = e.nativeEvent.pageY;
      }}
      style={styles.container}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: imageWidth,
    height: imageHeight,
    padding: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
  },
});

export default ProfilePostPanel;
