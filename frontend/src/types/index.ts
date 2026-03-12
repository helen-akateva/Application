export interface BaseUser {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export type User = BaseUser;
export type Organizer = BaseUser;
export type Participant = BaseUser;

export type EventVisibility = "public" | "private";

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
  tags: Tag[];
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
  tagIds?: number[];
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  visibility?: EventVisibility;
  tagIds?: number[];
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}
