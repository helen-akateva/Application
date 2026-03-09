import api from './axios';
import type { AuthResponse } from '../types';

export const loginUser = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const registerUser = async (email: string, password: string, name: string) => {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
  return data;
};

export const logoutUser = () => api.post('/auth/logout');