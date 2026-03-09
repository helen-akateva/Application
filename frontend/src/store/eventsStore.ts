import { create } from 'zustand';
import type { EventListItem, EventDetails } from '../types';

interface EventsStore {
  events: EventListItem[];
  currentEvent: EventDetails | null;
  isLoading: boolean;
  error: string | null;

  setEvents: (events: EventListItem[]) => void;
  setCurrentEvent: (event: EventDetails | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateEventParticipantCount: (eventId: number, delta: number) => void;
}

export const useEventsStore = create<EventsStore>()((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Update the participant count without re-requesting the API
  updateEventParticipantCount: (eventId, delta) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? { ...e, participantsCount: e.participantsCount + delta }
          : e,
      ),
    })),
}));