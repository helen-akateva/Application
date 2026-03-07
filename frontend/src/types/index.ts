export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export type EventVisibility = 'public' | 'private';

export interface Organizer {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Participant {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  visibility: EventVisibility;
  organizer: Organizer;
  createdAt: string;
  updatedAt: string;
}

// GET /events 
export interface EventListItem extends Event {
  participantsCount: number;
}

// GET /events/:id 
export interface EventDetails extends Event {
  participants: Participant[];
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity?: number;
  visibility: EventVisibility;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  visibility?: EventVisibility;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
}