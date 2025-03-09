import React, { createContext, useContext, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login as loginApi,
  signOut as signOutApi,
  getUser as getUserApi,
  LoginResponse,
  User,
} from "../constants/api";

interface AuthContextType {
  user: User | undefined | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

// SecureStore のキー
const ACCESS_TOKEN_KEY = "accessToken";
const ID_TOKEN_KEY = "idToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// currentUser を取得する fetcher 関数
const fetchCurrentUser = async (): Promise<User | null> => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (!token) {
    return null;
  }
  try {
    return await getUserApi(token);
  } catch (error) {
    // 無効なトークンの場合は削除して null を返す
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: Infinity,
  });

  // login 用の mutation
  const loginMutation = useMutation<User, Error, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      const { accessToken, idToken, refreshToken, user: userData }: LoginResponse =
        await loginApi(email, password);
      if (!accessToken || accessToken.trim() === "") {
        throw new Error("無効なアクセストークンが返されました");
      }
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(ID_TOKEN_KEY, idToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      return userData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data);
    },
    onError: async () => {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      queryClient.setQueryData(["currentUser"], null);
    },
  });

  // logout 用の mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (token) {
        await signOutApi(token);
      }
      // ログアウト時は全トークン削除
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
