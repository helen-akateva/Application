import api from "./axios";
import type { Tag } from "../types";

export const fetchTags = async (): Promise<Tag[]> => {
  const { data } = await api.get<Tag[]>("/tags");
  return data;
};

export const createTag = async (name: string, color?: string): Promise<Tag> => {
  const { data } = await api.post<Tag>("/tags", { name, color });
  return data;
};
