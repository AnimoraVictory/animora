import { fetchApi } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

export const useResetPassword = () => {
  const requestResetPasswordMutation = useMutation({
    mutationFn: (email: string) => {
      return fetchApi({
        method: 'POST',
        path: `auth/request-reset-password?email=${email}`,
        schema: z.any(),
        options: {},
        token: null,
      });
    },
  });

  const confirmResetPasswordMutation = useMutation({
    mutationFn: ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => {
      return fetchApi({
        method: 'POST',
        path: `auth/confirm-reset-password?email=${email}&code=${code}&newPassword=${newPassword}`,
        schema: z.any(),
        options: {},
        token: null,
      });
    },
  });

  return {
    requestResetPasswordMutation,
    confirmResetPasswordMutation,
  };
};
