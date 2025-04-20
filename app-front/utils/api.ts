import axios, { AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { z } from 'zod';

/**
 * APIリクエストを行い、レスポンスをバリデーションして返す。
 * 失敗した場合はErrorをthrowする。
 * @param path リクエスト先のパス
 * @param schema レスポンスのスキーマ
 * @param options リクエストオプション
 * @returns バリデーション済みのレスポンス
 */
export async function fetchApi<T>({
  method,
  path,
  schema,
  options = {},
  token,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  schema: z.ZodType<T>;
  options: AxiosRequestConfig<any>;
  token: string | null;
}): Promise<T> {
  const BASE_URL = Constants.expoConfig?.extra?.API_URL;
  if (!BASE_URL) {
    throw new Error('API_URL is not set');
  }

  const API_URL = new URL(path, BASE_URL).toString();

  const response = await axios.request({
    method,
    url: API_URL,
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status !== 200) {
    throw new Error(`API request failed: ${response.status}`);
  }
  const result = schema.safeParse(response.data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error}`);
  }
  return result.data;
}
