import { BACK_END_URL } from '@env';

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
  const response = await fetch(`${BACK_END_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'ログインに失敗しました');
  }

  const data: LoginResponse = await response.json();
  return data;
};

export const signUp = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${BACK_END_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'サインアップに失敗しました');
  }
};


export const signOut = async (accessToken: string): Promise<void> => {
  const response = await fetch(`${BACK_END_URL}/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'ログアウトに失敗しました');
  }
};

export const getUser = async (accessToken: string): Promise<User> => {
  const response = await fetch(`${BACK_END_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'ユーザー情報の取得に失敗しました');
  }

  return await response.json();
};

export const verifyEmail = async (email: string, code: string): Promise<void> => {
  const response = await fetch(`${BACK_END_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'メール認証に失敗しました');
  }
};
