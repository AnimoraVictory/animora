import axios from 'axios';
import Constants from 'expo-constants';
import { useMutation, useQuery } from '@tanstack/react-query';

const API_URL = Constants.expoConfig?.extra?.API_URL

export interface User {
  id: string;
  email: string;
  name: string;
  bio: string;
  iconImageUrl: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

// APIクライアント関数
export const api = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/signin`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  signUp: async (email: string, password: string, name: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/signup`, { email, password, name }, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  signOut: async (accessToken: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/signout`, null, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
  },

  getUser: async (accessToken: string): Promise<User> => {
    const response = await axios.get<User>(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    return response.data;
  },

  verifyEmail: async (email: string, code: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/verify-email`, { email, code }, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
};

// React Query Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      api.login(email, password),
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) => 
      api.signUp(email, password, name),
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: (accessToken: string) => api.signOut(accessToken),
  });
};

export const useGetUser = (accessToken: string | null) => {
  return useQuery({
    queryKey: ['user', accessToken],
    queryFn: () => accessToken ? api.getUser(accessToken) : null,
    enabled: !!accessToken,
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => 
      api.verifyEmail(email, code),
  });
};
