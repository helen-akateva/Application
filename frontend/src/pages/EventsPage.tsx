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
import { fetchTags } from "../api/tags";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import type { Tag } from "../types";

const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set());
  const [availableTags, setAvailableTags] = useState<Tag[]>([]); // ← додати
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]); // ← додати

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, tags] = await Promise.all([
          fetchEvents(),
          fetchTags(), // ← завантажуємо теги разом з подіями
        ]);
        setEvents(data);
        setAvailableTags(tags);

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

  // ← toggle тегу у фільтрі
  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
    setCurrentPage(1);
  };

  const filteredEvents = useMemo(() => {
    let result = events;

    // фільтр по тексту
    const query = search.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query),
      );
    }

    // ← фільтр по тегах
    if (selectedTagIds.length > 0) {
      result = result.filter((e) =>
        e.tags?.some((tag) => selectedTagIds.includes(tag.id)),
      );
    }

    return result;
  }, [events, search, selectedTagIds]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filteredEvents, currentPage]);

  const noResults =
    !isLoading && !error && events.length > 0 && filteredEvents.length === 0;

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

      {/* Search */}
      <form
        role="search"
        className="relative mb-4 max-w-sm"
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
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search events..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </form>

      {/* ← Tag filter */}
      {availableTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium border transition-all ${
                  isSelected
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
                style={
                  isSelected ? { backgroundColor: tag.color ?? "#6b7280" } : {}
                }
              >
                {tag.name}
              </button>
            );
          })}
          {selectedTagIds.length > 0 && (
            <button
              onClick={() => {
                setSelectedTagIds([]);
                setCurrentPage(1);
              }}
              className="rounded-full px-3 py-1 text-sm text-gray-400 hover:text-gray-600 border border-dashed border-gray-300"
            >
              Clear filters ✕
            </button>
          )}
        </div>
      )}

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

      {/* ← Empty state для тег-фільтру */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-gray-700">
            {selectedTagIds.length > 0
              ? "No events match the selected tags."
              : "No events found"}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Try a different search term or filter.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedTagIds([]);
            }}
            className="mt-3 text-green-600 hover:text-green-700"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {!isLoading && !error && paginatedEvents.length > 0 && (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {paginatedEvents.map((event) => (
              <li key={event.id} className="flex w-full">
                <EventCard
                  event={event}
                  isJoined={joinedEventIds.has(event.id)}
                  isOrganizer={event.organizer.id === user?.id}
                  onJoinLeave={handleJoinLeave}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-40"
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-40"
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
