import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { AxiosError } from "axios";
import type { EventListItem, ApiError } from "../types";
import { TagChip } from "./TagChip";

interface EventCardProps {
  event: EventListItem;
  isJoined: boolean;
  isOrganizer: boolean;
  onJoinLeave: (eventId: number, joined: boolean) => Promise<void>;
}

export default function EventCard({
  event,
  isJoined,
  isOrganizer,
  onJoinLeave,
}: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull =
    event.capacity !== null && event.participantsCount >= event.capacity;

  const date = new Date(event.date);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleJoinLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setError(null);
    try {
      await onJoinLeave(event.id, isJoined);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="relative flex w-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md h-[300px]">
      <header className="mb-3 min-h-[80px]">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          <Link
            to={`/events/${event.id}`}
            className="hover:underline before:absolute before:inset-0"
          >
            {event.title} <span className="font-normal text-gray-400">→</span>
          </Link>
        </h3>
        <p className="mt-1 min-h-[40px] text-sm text-gray-500 line-clamp-2">
          {event.description ?? ""}
        </p>
        {/* ← теги */}
        {event.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </header>

      <section className="flex-1">
        <ul className="space-y-1.5">
          <li className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <time dateTime={event.date}>{formattedDate}</time>
          </li>
          <li className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedTime}</span>
          </li>
          <li className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </li>
          <li className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>
              {event.participantsCount}
              {event.capacity !== null && ` / ${event.capacity}`} participants
            </span>
          </li>
        </ul>
      </section>

      <footer className="relative z-10 mt-4">
        {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
        {isOrganizer ? (
          <div className="w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-gray-400">
            Your Event
          </div>
        ) : isFull && !isJoined ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-400"
          >
            Full
          </button>
        ) : (
          <button
            onClick={handleJoinLeave}
            disabled={isLoading}
            className={`w-full rounded-lg py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isJoined
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isLoading ? "Loading..." : isJoined ? "Leave Event" : "Join Event"}
          </button>
        )}
      </footer>
    </article>
  );
}
