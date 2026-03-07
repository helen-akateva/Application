import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useEventsStore } from "../store/eventsStore";
import { useAuthStore } from "../store/authStore";
import {
  fetchEvents,
  fetchUserEvents,
  joinEvent,
  leaveEvent,
} from "../api/events";
import EventCard from "../components/EventCard";

export default function EventsPage() {
  const {
    events,
    setEvents,
    setLoading,
    setError,
    isLoading,
    error,
    updateEventParticipantCount,
  } = useEventsStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEvents();
        setEvents(data);

        if (isAuthenticated) {
          const userEvents = await fetchUserEvents();
          setJoinedEventIds(new Set(userEvents.map((e) => e.id)));
        } else {
          setJoinedEventIds(new Set());
        }
      } catch {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [isAuthenticated, setEvents, setLoading, setError]);

  const handleJoinLeave = async (eventId: number, currentlyJoined: boolean) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentlyJoined) {
      await leaveEvent(eventId);
      updateEventParticipantCount(eventId, -1);
      setJoinedEventIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    } else {
      await joinEvent(eventId);
      updateEventParticipantCount(eventId, +1);
      setJoinedEventIds((prev) => new Set(prev).add(eventId));
    }
  };

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return events;

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query),
    );
  }, [events, search]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Discover Events
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Find and join exciting events happening around you
        </p>
      </header>

      <form
        role="search"
        className="relative mb-6 max-w-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="search-events" className="sr-only">
          Search events
        </label>
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          id="search-events"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </form>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading events...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-gray-700">No events yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Check back later for upcoming events.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        events.length > 0 &&
        filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-medium text-gray-700">No events found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try a different search term.
            </p>
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search and show all events"
              className="mt-3 text-sm text-green-600 hover:text-green-700"
            >
              Clear search
            </button>
          </div>
        )}

      {!isLoading && !error && filteredEvents.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <li key={event.id}>
              <EventCard
                event={event}
                isJoined={joinedEventIds.has(event.id)}
                isOrganizer={event.organizer.id === user?.id}
                onJoinLeave={handleJoinLeave}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
