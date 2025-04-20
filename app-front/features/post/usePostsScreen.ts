import { useAuth } from '@/providers/AuthContext';
import { PostResponse } from './schema/response';
import useToggleLike from '@/hooks/useToggleLike';
import { useCallback, useState } from 'react';

type Props = {
  post: PostResponse;
};

export default function usePostsScreen({ post }: Props) {
  const { user: currentUser } = useAuth();

  const [likedByCurrentUser, setLikedByCurrentUser] = useState<boolean>(
    post.likes?.some((like) => like.user.id === currentUser?.id) ?? false
  );

  const { setLiked, isLoading: isLoadingLike } = useToggleLike(
    post.id,
    currentUser?.id ?? ''
  );

  const handleToggleLike = useCallback(async () => {
    if (isLoadingLike) return;

    if (!likedByCurrentUser) {
      setLikedByCurrentUser(true);
      setLiked(true);
    } else {
      setLikedByCurrentUser(false);
      setLiked(false);
      setLikedByCurrentUser(false);
    }
  }, [isLoadingLike, likedByCurrentUser, setLiked]);

  const handleLike = useCallback(() => {
    if (likedByCurrentUser) {
      return;
    }
    setLikedByCurrentUser(true);
    setLiked(true);
  }, [likedByCurrentUser, setLiked]);

  return {
    likedByCurrentUser,
    handleToggleLike,
    isLoadingLike,
    handleLike,
  };
}
