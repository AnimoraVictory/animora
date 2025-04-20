import { useAuth } from '@/providers/AuthContext';
import { fetchApi } from '@/utils/api';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';
import { Comment } from '../comment/schema';
import { PostResponse } from './schema/response';
type Props = {
  post: PostResponse;
  onClose: () => void;
};

export default function usePostModal({ post, onClose }: Props) {
  const { user, refetch, token } = useAuth();

  const [comments, setComments] = useState(post.comments);

  const isMyPost = useMemo(
    () => (post.user.id === user?.id ? true : false),
    [post.user.id, user?.id]
  );

  const onNewComment = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleDelete = useCallback(async () => {
    try {
      await fetchApi({
        method: 'DELETE',
        path: `/posts/delete?id=${post.id}`,
        schema: z.void(),
        options: {},
        token,
      });
      Alert.alert('完了', 'ポストを削除しました');
      refetch();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '削除に失敗しました');
    }
  }, [onClose, post.id, refetch, token]);

  return { isMyPost, comments, onNewComment, handleDelete };
}
