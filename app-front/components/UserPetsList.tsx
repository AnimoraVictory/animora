import React from "react";
import { FlatList, RefreshControl, Text, View, StyleSheet, useColorScheme } from "react-native";
import PetPanel from "@/components/PetPanel";
import { Pet } from "@/constants/api";
import { Colors } from "@/constants/Colors";

type Props = {
  pets: Pet[];
  refreshing: boolean;
  onRefresh: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
  headerComponent: React.JSX.Element;
};

export const UserPetList: React.FC<Props> = ({ pets, refreshing, onRefresh, colorScheme, headerComponent }) => {
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "dark" ? "black" : "white";

  return (
    <FlatList
      data={pets}
      keyExtractor={(item) => item.id}
      numColumns={1}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderColor: colors.icon }}>
          <PetPanel pet={item} colorScheme={colorScheme} />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colorScheme === "light" ? "black" : "white"}
        />
      }
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor,
        paddingBottom: 20,
      }}
      ListEmptyComponent={
        <Text style={{ color: colors.text, textAlign: "center", marginTop: 32 }}>
          マイペットを登録しましょう！
        </Text>
      }
    />
  );
};
