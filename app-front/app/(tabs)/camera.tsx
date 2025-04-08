import { CreatePostModal } from "@/components/CreatePostModal";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useFocusEffect(
    useCallback(() => {
      slideAnim.setValue(height);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [slideAnim])
  );
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(tabs)/posts");
    });
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>カメラの許可が必要です</Text>
        <Button title="許可する" onPress={requestPermission} />
      </View>
    );
  }

  const handleFlip = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      {photoUri ? (
        <CreatePostModal
        photoUri={photoUri}
        onClose={() => setPhotoUri("")}
        />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleClose()}
          >
            <Text style={styles.closeText}>x</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={handleFlip}>
            <Text style={styles.flipText}>↺</Text>
          </TouchableOpacity>
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.shutterButton} onPress={takePhoto} />
          </View>
        </CameraView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: "center",
    marginTop: 20,
  },
  preview: {
    flex: 1,
    resizeMode: "cover",
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#ccc",
  },
  flipButton: {
    position: "absolute",
    width: 50,
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 10,
  },
  flipText: {
    textAlign: "center",
    fontSize: 24,
    color: "#fff",
  },
  closeButton: {
    position: "absolute",
    width: 50,
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  closeText: {
    textAlign: "center",
    fontSize: 24,
    color: "#fff",
  },
});
