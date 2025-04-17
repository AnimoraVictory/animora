import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { UserBase } from "@/constants/api";

const { width } = Dimensions.get("window");

type Props = {
  users: UserBase[];
  onSelectUser: (email: string) => void;
  backgroundColor: string;
};

export default function UsersList({
  users,
  onSelectUser,
  backgroundColor,
}: Props) {
  return (
    <FlatList
      data={users}
      style={{ width, backgroundColor }}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => onSelectUser(item.email)}
        >
          <Image
            source={
              item.iconImageUrl
                ? { uri: item.iconImageUrl }
                : require("@/assets/images/profile.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.userName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  userItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
