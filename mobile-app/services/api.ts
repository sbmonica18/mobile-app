import axios from 'axios';

/**
 * Use your PC LAN IP when testing on a physical phone with Expo Go, e.g.:
 * EXPO_PUBLIC_API_URL=http://192.168.1.18:8080/api
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export type ApiError = Error & { status?: number };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.';
    const apiError: ApiError = new Error(
      typeof message === 'string' ? message : 'Request failed',
    );
    apiError.status = status;
    return Promise.reject(apiError);
  },
);

export function isAuthFailure(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const status = (error as ApiError).status;
  return status === 401 || status === 403;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
