import React, { useState } from "react";
import { FlatList, Text, useColorScheme } from "react-native";
import ProfilePostPanel from "@/components/ProfilePostPanel";
import { Post } from "@/components/PostPanel";
import { Colors } from "@/constants/Colors";
import PostModal from "./PostModal";
import { useModalStack } from "@/providers/ModalStackContext";

type Props = {
  posts: Post[];
  colorScheme: ReturnType<typeof useColorScheme>;
};

export const UserPostList: React.FC<Props> = ({ posts, colorScheme }) => {
  const { push, pop } = useModalStack();
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
            onPress={() => {
              push("post");
              setSelectedPost(item);
            }}
          />
        )}
        scrollEnabled={false}
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
            投稿しましょう！
          </Text>
        }
      />

      {selectedPost && (
        <PostModal
          post={selectedPost}
          visible={true}
          onClose={() => {
            pop();
            setSelectedPost(null);
          }}
        />
      )}
    </>
  );
};
