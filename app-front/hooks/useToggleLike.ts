import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const useToggleLike = (postId: string, userId: string) => {
  const queryClient = useQueryClient();

  const createLikeMutation = useMutation({
    mutationFn: () =>
      axios.post(`${API_URL}/likes/new?userId=${userId}&postId=${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("likeに失敗しました", error);
    },
  });

  const deleteLikeMutation = useMutation({
    mutationFn: () =>
      axios.delete(`${API_URL}/likes/delete?userId=${userId}&postId=${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Like削除エラー", error);
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

  const isLoading = createLikeMutation.isPending || deleteLikeMutation.isPending;

  return { toggleLike, isLoading };
};

export default useToggleLike;