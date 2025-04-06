import React from "react";
import { TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";

export type ProfilePostPanelProps = {
  imageUrl: string;
  onPress?: () => void;
};

const windowWidth = Dimensions.get("window").width;
const imageWidth = windowWidth / 3;
const imageHeight = (imageWidth * 4) / 3;

export const ProfilePostPanel: React.FC<ProfilePostPanelProps> = ({
  imageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
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
