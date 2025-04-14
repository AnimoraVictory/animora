import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const useToggleLike = (postId: string, userId: string) => {
  const queryClient = useQueryClient();

  const createLikeMutation = useMutation({
    mutationFn: () =>
      axios.post(`${API_URL}/likes/new?userId=${userId}&postId=${postId}`),
    onMutate: async () => {
      // 対象のpostsクエリをキャンセルしてスナップショットを取る
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<any[]>(["posts"]);
      // 楽観的更新：対象の投稿の likesCount を +1、かつ likedByCurrentUser を true に更新
      queryClient.setQueryData<any[]>(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likedByCurrentUser: true,
            };
          }
          return p;
        });
      });
      return { previousPosts };
    },
    onError: (_, __, context) => {
      // エラー発生時はキャッシュを元に戻す
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Like解除の楽観的更新付きミューテーション
  const deleteLikeMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${API_URL}/likes/delete?userId=${userId}&postId=${postId}`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<any[]>(["posts"]);
      queryClient.setQueryData<any[]>(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likedByCurrentUser: false,
            };
          }
          return p;
        });
      });
      return { previousPosts };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const toggleLike = (liked: boolean) => {
    if (createLikeMutation.isPending || deleteLikeMutation.isPending) return;
    if (liked) {
      deleteLikeMutation.mutate();
    } else {
      createLikeMutation.mutate();
    }
  };

  const isLoading =
    createLikeMutation.isPending || deleteLikeMutation.isPending;

  return { toggleLike, isLoading };
};

export default useToggleLike;
