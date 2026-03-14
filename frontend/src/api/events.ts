import api from "./axios";
import type {
  EventListItem,
  EventDetails,
  CreateEventPayload,
  UpdateEventPayload,
} from "../types";

export const fetchEvents = async (tagIds?: number[]) => {
  const params = new URLSearchParams();
  if (tagIds && tagIds.length > 0) {
    tagIds.forEach((id) => params.append("tagIds", id.toString()));
  }
  const { data } = await api.get<EventListItem[]>("/events", { params });
  return data;
};

export const fetchEventById = async (id: number) => {
  const { data } = await api.get<EventDetails>(`/events/${id}`);
  return data;
};

export const createEvent = async (payload: CreateEventPayload) => {
  const { data } = await api.post<EventDetails>("/events", payload);
  return data;
};

export const updateEvent = async (id: number, payload: UpdateEventPayload) => {
  const { data } = await api.patch<EventDetails>(`/events/${id}`, payload);
  return data;
};

export const deleteEvent = (id: number) => api.delete(`/events/${id}`);

export const joinEvent = (id: number) => api.post(`/events/${id}/join`);

export const leaveEvent = (id: number) => api.post(`/events/${id}/leave`);

export const fetchUserEvents = async () => {
  const { data } = await api.get<EventListItem[]>("/users/me/events");
  return data;
};
