import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  login as loginApi,
  signOut as signOutApi,
  getUser as getUserApi,
  LoginResponse,
  User,
} from "../constants/api";

interface AuthContextType {
  user: User | null;
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

// SecureStore に保存するキーを分ける例
const ACCESS_TOKEN_KEY = "accessToken";
const ID_TOKEN_KEY = "idToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // アプリ起動時にアクセストークンを読み込んでユーザー情報を取得
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (accessToken) {
          const userData = await getUserApi(accessToken);
          setUser(userData);
        }
      } catch (error) {
        console.error("トークンまたはユーザー情報の読み込みに失敗:", error);
        // トークンが無効なら削除しておく
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ログイン処理
  const login = async (email: string, password: string) => {
    try {
      const {
        accessToken,
        idToken,
        refreshToken,
        user: userData,
      }: LoginResponse = await loginApi(email, password);

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(ID_TOKEN_KEY, idToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      // ユーザー情報をステートに保存
      setUser(userData);
    } catch (error) {
      // ログイン失敗時はトークン削除
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setUser(null);
      throw error;
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (accessToken) {
        await signOutApi(accessToken);
      }
      // ログアウト時は全トークン削除
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error("ログアウト処理に失敗:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
