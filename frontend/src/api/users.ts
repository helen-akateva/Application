import api from './axios';
import type { User } from '../types';

export const getMe = async () => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};