import { GetPostsResponse } from '@/features/post/schema/response';
import { useAuth } from '@/providers/AuthContext';
import { fetchApi } from '@/utils/api';
import {
  useQueryClient,
  useMutation,
  InfiniteData,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

const useToggleLike = (postId: string, userId: string) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const createLikeMutation = useMutation({
    mutationFn: () =>
      fetchApi({
        method: 'POST',
        path: `likes/new?userId=${userId}&postId=${postId}`,
        schema: z.any(),
        options: {},
        token,
      }),
    onMutate: async () => {
      // 対象のpostsクエリをキャンセルしてスナップショットを取る
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<any[]>(['posts']);
      // 楽観的更新：対象の投稿の likesCount を +1、かつ likedByCurrentUser を true に更新
      queryClient.setQueryData(
        ['posts'],
        (oldData: InfiniteData<GetPostsResponse> | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      likedByCurrentUser: true,
                      likesCount: p.likesCount + 1,
                    }
                  : p
              ),
            })),
          };
        }
      );
      return { previousPosts };
    },
    onError: (_, __, context) => {
      // エラー発生時はキャッシュを元に戻す
      queryClient.setQueryData(['posts'], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Like解除の楽観的更新付きミューテーション
  const deleteLikeMutation = useMutation({
    mutationFn: () =>
      fetchApi({
        method: 'DELETE',
        path: `likes/delete?userId=${userId}&postId=${postId}`,
        schema: z.any(),
        options: {},
        token,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<any[]>(['posts']);
      queryClient.setQueryData(
        ['posts'],
        (oldData: InfiniteData<GetPostsResponse> | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      likedByCurrentUser: true,
                      likesCount: p.likesCount - 1,
                    }
                  : p
              ),
            })),
          };
        }
      );
      return { previousPosts };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const setLiked = (liked: boolean) => {
    /** likedの状態に更新する。*/
    if (createLikeMutation.isPending || deleteLikeMutation.isPending) {
      return;
    }
    if (liked) {
      createLikeMutation.mutate();
    } else {
      deleteLikeMutation.mutate();
    }
  };

  const isLoading = useMemo(
    () => createLikeMutation.isPending || deleteLikeMutation.isPending,
    [createLikeMutation.isPending, deleteLikeMutation.isPending]
  );

  return { setLiked, isLoading };
};

export default useToggleLike;
