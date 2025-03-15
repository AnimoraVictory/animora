import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`http://localhost:3000/auth/signin`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    const errMsg = error.response?.data?.error || 'ログインに失敗しました';
    throw new Error(errMsg);
  }
};

export const signUp = async (email: string, password: string, name: string): Promise<void> => {
  try {
    await axios.post(`http://localhost:3000/auth/signup`, { email, password, name }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    const errMsg = error.response?.data?.error || 'サインアップに失敗しました';
    throw new Error(errMsg);
  }
};

export const signOut = async (accessToken: string): Promise<void> => {
  try {
    await axios.post(`http://localhost:3000/auth/signout`, null, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
  } catch (error: any) {
    const errMsg = error.response?.data?.error || 'ログアウトに失敗しました';
    throw new Error(errMsg);
  }
};

export const getUser = async (accessToken: string): Promise<User> => {
  try {
    const response = await axios.get<User>(`http://localhost:3000/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    return response.data;
  } catch (error: any) {
    const errMsg = error.response?.data?.error || 'ユーザー情報の取得に失敗しました';
    throw new Error(errMsg);
  }
};

export const verifyEmail = async (email: string, code: string): Promise<void> => {
  try {
    await axios.post(`http://localhost:3000/auth/verify-email`, { email, code }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    const errMsg = error.response?.data?.error || 'メール認証に失敗しました';
    throw new Error(errMsg);
  }
};
