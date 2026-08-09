import { apiClient } from '@/services/api';
import type { AuthResponse, ForgotPasswordResponse, User } from '@/types/auth';

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
}) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
    email,
  });
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    newPassword,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export async function updateProfile(payload: import('@/types/auth').UpdateProfilePayload) {
  const { useAuthStore } = await import('@/store/authStore');
  const token = useAuthStore.getState().token;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  const { data } = await apiClient.put<User>('/auth/me', payload);
  return data;
}
