import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";
import { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import {
  fetchEventById,
  joinEvent,
  leaveEvent,
  deleteEvent,
} from "../api/events";
import type { EventDetails, ApiError } from "../types";
import Button from "../components/Button";
import { TagChip } from "../components/TagChip";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Reference for native dialog
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 1. Load data logic
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchEventById(Number(id));
        setEvent(data);
      } catch {
        setError("Event not found or server error");
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  // 2. Manage modal with native API
  useEffect(() => {
    const dialog = dialogRef.current;
    if (showDeleteModal) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [showDeleteModal]);

  if (isLoading)
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-gray-400"
        aria-live="polite"
      >
        Loading event details...
      </div>
    );

  if (error || !event)
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p role="alert" className="text-red-600 mb-4">
          {error || "Event not found"}
        </p>
        <Link to="/" className="text-green-600 hover:underline">
          Return to Home
        </Link>
      </main>
    );

  const isOrganizer = user?.id === event.organizer.id;
  const isParticipant = event.participants.some((p) => p.id === user?.id);
  const isFull =
    event.capacity !== null && event.participants.length >= event.capacity;

  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // 3. Join/Leave logic (with errors)
  const handleJoinLeave = async () => {
    if (!isAuthenticated) return navigate("/login");

    setActionLoading(true);
    setActionError(null);

    try {
      if (isParticipant) {
        await leaveEvent(event.id);
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                participants: prev.participants.filter(
                  (p) => p.id !== user!.id,
                ),
              }
            : null,
        );
      } else {
        await joinEvent(event.id);
        setEvent((prev) =>
          prev && user
            ? {
                ...prev,
                participants: [
                  ...prev.participants,
                  { ...user, createdAt: "" },
                ],
              }
            : null,
        );
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setActionError(
        axiosError.response?.data?.message ||
          "Action failed. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteEvent(event.id);
      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setActionError(
        axiosError.response?.data?.message || "Failed to delete event",
      );
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      {/* Navigation */}
      <nav aria-label="Back" className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to events list
        </Link>
      </nav>

      <article>
        {/* Event Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {event.title}
            </h1>

            {isOrganizer && (
              <div
                className="flex items-center gap-2"
                role="group"
                aria-label="Organizer controls"
              >
                <Button
                  variant="outline"
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  leftIcon={<Pencil className="h-4 w-4" aria-hidden="true" />}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
          {event.description && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {event.description}
            </p>
          )}

          {event.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} size="md" />
              ))}
            </div>
          )}
        </header>

        {/* Details Card */}
        <section
          className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          aria-label="Quick details"
        >
          <ul className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            <li className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-5 w-5 text-green-600" aria-hidden="true" />
              <div>
                <span className="sr-only">Date:</span>
                <time dateTime={event.date}>{formattedDate}</time>
              </div>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
              <div>
                <span className="sr-only">Time:</span>
                <span>{formattedTime}</span>
              </div>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <MapPin className="h-5 w-5 text-green-600" aria-hidden="true" />
              <div>
                <span className="sr-only">Location:</span>
                <address className="not-italic">{event.location}</address>
              </div>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Users className="h-5 w-5 text-green-600" aria-hidden="true" />
              <div>
                <span className="sr-only">Attendance:</span>
                <span>
                  {event.participants.length}{" "}
                  {event.capacity ? `/ ${event.capacity}` : ""} joined
                </span>
              </div>
            </li>
          </ul>
        </section>

        {/* Organizer Info */}
        <section className="mb-10" aria-labelledby="organizer-heading">
          <h2
            id="organizer-heading"
            className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4"
          >
            Hosted by
          </h2>
          <div className="flex items-center gap-3 p-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">
              {getInitials(event.organizer.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {event.organizer.name}
              </span>
              <span className="text-xs text-gray-500">Event Organizer</span>
            </div>
          </div>
        </section>

        {/* Participants List */}
        <section className="mb-10" aria-labelledby="participants-heading">
          <h2
            id="participants-heading"
            className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4"
          >
            Attendees ({event.participants.length})
          </h2>
          {event.participants.length === 0 ? (
            <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-4 text-center border border-dashed">
              No one has joined yet. Be the pioneer!
            </p>
          ) : (
            <ul className="flex flex-wrap gap-3">
              {event.participants.map((p) => (
                <li
                  key={p.id}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-1.5 pr-4 text-sm font-medium text-gray-700"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm">
                    {getInitials(p.name)}
                  </div>
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer with actions */}
        {!isOrganizer && (
          <footer className="sticky bottom-6 mt-12 md:static">
            {actionError && (
              <p
                role="alert"
                className="mb-2 text-sm text-red-500 font-medium text-center md:text-left"
              >
                {actionError}
              </p>
            )}
            <Button
              onClick={handleJoinLeave}
              isLoading={actionLoading}
              variant={isParticipant ? "outline" : "primary"}
              disabled={!isParticipant && isFull}
              size="lg"
              className="w-full md:w-auto md:px-12"
            >
              {isParticipant
                ? "Leave Event"
                : isFull
                  ? "Event Full"
                  : !isAuthenticated
                    ? "Login to Join"
                    : "Join This Event"}
            </Button>
          </footer>
        )}
      </article>

      {/* Native dialog for delete */}
      <dialog
        ref={dialogRef}
        onClose={() => setShowDeleteModal(false)}
        className="m-auto rounded-2xl p-0 shadow-2xl backdrop:bg-gray-900/60 backdrop:backdrop-blur-sm animate-in fade-in zoom-in duration-200"
      >
        <div className="w-full max-w-sm p-8 bg-white">
          <p className="text-lg font-medium text-gray-900 mb-8 leading-relaxed text-center">
            Are you sure you want to delete this event?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="full"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="full"
              isLoading={actionLoading}
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
