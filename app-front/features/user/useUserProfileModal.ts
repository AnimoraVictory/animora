import { useAuth } from '@/providers/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { UserResponse, userResponseSchema } from './schema/response';

type Props = {
  email: string;
  visible: boolean;
};

export default function useUserProfileModal({ email, visible }: Props) {
  const queryClient = useQueryClient();
  const { user: currentUser, token } = useAuth();

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<UserResponse>({
    queryKey: ['userProfile', email],
    queryFn: async () => {
      const res = await fetchApi({
        method: 'GET',
        path: `users?email=${email}`,
        schema: z.object({ user: userResponseSchema }),
        options: {},
        token,
      });
      return res.user;
    },
    enabled: !!email && visible,
  });

  const isMe = useMemo(() => {
    return !!user?.id && user.id === currentUser?.id;
  }, [currentUser?.id, user?.id]);

  const isFollowing = useMemo(() => {
    if (!user) return false;
    return user.followers.some((f) => f.id === currentUser?.id);
  }, [user, currentUser?.id]);

  const followMutation = useMutation({
    mutationFn: () =>
      fetchApi({
        method: 'POST',
        path: `users/follow?toId=${user?.id}&fromId=${currentUser?.id}`,
        schema: z.any(),
        options: {},
        token,
      }),
    onSuccess: () => {
      queryClient.setQueryData(
        ['userProfile', email],
        (prev: UserResponse | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            followers: [...prev.followers, currentUser],
            followersCount: prev.followersCount + 1,
          };
        }
      );
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () =>
      fetchApi({
        method: 'DELETE',
        path: `users/unfollow?toId=${user?.id}&fromId=${currentUser?.id}`,
        schema: z.any(),
        options: {},
        token,
      }),
    onSuccess: () => {
      queryClient.setQueryData(
        ['userProfile', email],
        (prev: UserResponse | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            followers: prev.followers.filter((f) => f.id !== currentUser?.id),
            followersCount: prev.followersCount - 1,
          };
        }
      );
    },
  });

  const handlePressFollowButton = useCallback(() => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [followMutation, isFollowing, unfollowMutation]);

  return {
    user,
    isLoading,
    refetch,
    isRefetching,
    isMe,
    isFollowing,
    handlePressFollowButton,
  };
}
