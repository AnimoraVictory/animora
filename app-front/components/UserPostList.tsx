import React from "react";
import { FlatList, RefreshControl, Text, StyleSheet, useColorScheme } from "react-native";
import ProfilePostPanel from "@/components/ProfilePostPanel";
import { Post } from "@/components/PostPanel";
import { Colors } from "@/constants/Colors";

type Props = {
  posts: Post[];
  refreshing: boolean;
  onRefresh: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
  headerComponent: React.JSX.Element;
};

export const UserPostList: React.FC<Props> = ({ posts, refreshing, onRefresh, colorScheme, headerComponent }) => {
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme == "light" ? "white" : "black"

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      renderItem={({ item }) => (
        <ProfilePostPanel
          imageUrl={item.imageUrl}
          onPress={() => console.log("Tapped post:", item.id)}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colorScheme === "light" ? "black" : "white"}
        />
      }
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, backgroundColor }}
      ListEmptyComponent={
        <Text style={{ color: colors.text, textAlign: "center", marginTop: 32 }}>
          投稿しましょう！
        </Text>
      }
    />
  );
};
