import api from './axios';

export const askAI = async (question: string): Promise<string> => {
  const { data } = await api.post<{ answer: string }>('/ai/ask', { question });
  return data.answer;
};