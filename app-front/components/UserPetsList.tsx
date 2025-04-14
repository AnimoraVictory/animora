import React from "react";
import {
  FlatList,
  Text,
  View,
  useColorScheme,
} from "react-native";
import PetPanel from "@/components/PetPanel";
import { Pet } from "@/constants/api";
import { Colors } from "@/constants/Colors";

type Props = {
  pets: Pet[];
  colorScheme: ReturnType<typeof useColorScheme>;
  onScroll?: (event: any) => void;
};

export const UserPetList: React.FC<Props> = ({
  pets,
  colorScheme,
  onScroll,
}) => {
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "dark" ? "black" : "white";

  return (
    <FlatList
      data={pets}
      keyExtractor={(item) => item.id}
      numColumns={1}
      renderItem={({ item }) => (
        <View style={{ paddingTop: 2, borderColor: colors.icon }}>
          <PetPanel pet={item} colorScheme={colorScheme} />
        </View>
      )}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor,
        paddingBottom: 200,
      }}
      ListEmptyComponent={
        <Text
          style={{ color: colors.text, textAlign: "center", marginTop: 32 }}
        >
          マイペットを登録しましょう！
        </Text>
      }
    />
  );
};
