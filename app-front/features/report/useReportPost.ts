import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '@/utils/api';
import { z } from 'zod';
import { useAuth } from '@/providers/AuthContext';

export const useReportPost = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const sendReportMutation = useMutation({
    mutationFn: async ({
      postId,
      userId,
      reason,
    }: {
      postId: string;
      userId: string;
      reason: string;
    }) => {
      setLoading(true);

      const body = {
        postId,
        userId,
        reason,
      };

      // サーバーにPOSTリクエストを送る
      await fetchApi({
        method: 'POST',
        path: 'reports/send',
        schema: z.any(),
        options: {
          data: body,
        },
        token,
      });
      setLoading(false);
    },
    onError: (error) => {
      setLoading(false);
      console.error(error);
    },
  });

  return { sendReportMutation, loading };
};
