import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  useColorScheme,
  View,
} from "react-native";
import ProfilePostPanel from "@/components/ProfilePostPanel";
import { Post } from "@/components/PostPanel";
import { Colors } from "@/constants/Colors";
import PostModal from "./PostModal";

type Props = {
  posts: Post[];
  refreshing: boolean;
  onRefresh: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
  headerComponent: React.JSX.Element;
  onScroll?: (event: any) => void;
};

export const UserPostList: React.FC<Props> = ({
  posts,
  refreshing,
  onRefresh,
  colorScheme,
  headerComponent,
  onScroll,
}) => {
  const colors = Colors[colorScheme ?? "light"];
  const backgroundColor = colorScheme === "light" ? "white" : "black";

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <ProfilePostPanel
            imageUrl={item.imageUrl}
            onPress={() => setSelectedPost(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === "light" ? "black" : "white"}
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={{ backgroundColor: colors.background }}>
            {headerComponent}
          </View>
        }
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor,
          paddingBottom: 200,
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.text, textAlign: "center", marginTop: 32 }}>
            投稿しましょう！
          </Text>
        }
      />

      {selectedPost && (
        <PostModal
          post={selectedPost}
          visible={true}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
};
