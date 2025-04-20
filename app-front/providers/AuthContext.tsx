import React, { createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserResponse,
  userResponseSchema,
} from '@/features/user/schema/response';
import { fetchApi } from '@/utils/api';
import { LoginResponse, loginResponseSchema } from '@/features/auth/schema';
import { z } from 'zod';

interface AuthContextType {
  user: UserResponse | undefined | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
  refetch: async () => {},
  isRefetching: true,
  token: null,
});

// SecureStore のキー
const ACCESS_TOKEN_KEY = 'accessToken';
const ID_TOKEN_KEY = 'idToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [token, setToken] = React.useState<string | null>(null);

  // トークンの取得
  React.useEffect(() => {
    const getToken = async () => {
      const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      setToken(storedToken);
    };
    getToken();
  }, []);

  // ユーザー情報の取得
  const {
    data: user,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['user', token],
    queryFn: () =>
      token
        ? fetchApi({
            method: 'GET',
            path: 'auth/me',
            schema: userResponseSchema,
            token,
            options: {},
          })
        : null,
    enabled: !!token,
  });

  const refetchUser = async (): Promise<void> => {
    await refetch();
  };

  // login 用の mutation
  const loginMutation = useMutation<
    LoginResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: async ({ email, password }) =>
      await fetchApi({
        method: 'POST',
        path: 'auth/signin',
        schema: loginResponseSchema,
        options: {
          data: { email, password },
          headers: { 'Content-Type': 'application/json' },
        },
        token: null,
      }),
    onSuccess: async (response) => {
      if (response.accessToken) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.accessToken);
        await SecureStore.setItemAsync(ID_TOKEN_KEY, response.idToken);
        await SecureStore.setItemAsync(
          REFRESH_TOKEN_KEY,
          response.refreshToken
        );
        setToken(response.accessToken);
        queryClient.setQueryData(['user', response.accessToken], response.user);
      }
    },
    onError: async () => {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
      queryClient.setQueryData(['user', null], null);
    },
  });

  // logout 用の mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: () =>
      token
        ? fetchApi({
            method: 'POST',
            path: 'auth/signout',
            options: {
              headers: {
                'Content-Type': 'application/json',
              },
            },
            schema: z.void(),
            token,
          })
        : Promise.resolve(),
    onSuccess: async () => {
      // ログアウト時は全トークン削除
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
      queryClient.setQueryData(['user', null], null);
    },
    onError: async (error) => {
      // エラー時も全トークンを削除（セッションが無効な可能性があるため）
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
      queryClient.setQueryData(['user', null], null);
      throw error; // エラーを上位に伝播させる
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading: isLoading,
        refetch: refetchUser,
        isRefetching,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
