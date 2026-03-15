import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
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
import EventMeta from "../components/EventMeta";
import EventActions from "../components/EventActions";
import { TagChip } from "../components/TagChip";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [state, setState] = useState<{
    event: EventDetails | null;
    isLoading: boolean;
    error: string | null;
  }>({
    event: null,
    isLoading: true,
    error: null,
  });
  const { event, isLoading, error } = state;

  const [actionState, setActionState] = useState<{
    isLoading: boolean;
    error: string | null;
  }>({
    isLoading: false,
    error: null,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchEventById(Number(id));
        setState({ event: data, isLoading: false, error: null });
      } catch {
        setState({ event: null, isLoading: false, error: "Event not found or server error" });
      }
    };
    loadEvent();
  }, [id]);

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
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading event details...
      </div>
    );

  if (error || !event)
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p role="alert" className="text-red-600 mb-4">{error || "Event not found"}</p>
        <Link to="/" className="text-green-600 hover:underline">Return to Home</Link>
      </main>
    );

  const isOrganizer = user?.id === event.organizer.id;
  const isParticipant = event.participants.some((p) => p.id === user?.id);

  const handleJoinLeave = async () => {
    if (!isAuthenticated) return navigate("/login");
    setActionState({ isLoading: true, error: null });
    try {
      if (isParticipant) {
        await leaveEvent(event.id);
        setState((prev) => ({
          ...prev,
          event: prev.event
            ? {
                ...prev.event,
                participants: prev.event.participants.filter((p) => p.id !== user!.id),
              }
            : null,
        }));
      } else {
        await joinEvent(event.id);
        setState((prev) => ({
          ...prev,
          event: prev.event && user
            ? {
                ...prev.event,
                participants: [...prev.event.participants, { ...user, createdAt: "" }],
              }
            : null,
        }));
      }
      setActionState({ isLoading: false, error: null });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setActionState({
        isLoading: false,
        error: axiosError.response?.data?.message || "Action failed. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    setActionState({ isLoading: true, error: null });
    try {
      await deleteEvent(event.id);
      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setActionState({
        isLoading: false,
        error: axiosError.response?.data?.message || "Failed to delete event",
      });
      setShowDeleteModal(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <nav className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to events list
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <article>
            <header className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {event.title}
              </h1>
              {event.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <TagChip key={tag.id} tag={tag} size="md" />
                  ))}
                </div>
              )}
            </header>

            <section className="mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </section>

            <EventActions
              isJoined={isParticipant}
              isOrganizer={isOrganizer}
              onJoinLeave={handleJoinLeave}
              onEdit={() => navigate(`/events/${event.id}/edit`)}
              onDelete={() => setShowDeleteModal(true)}
              isLoading={actionState.isLoading}
              isAuthenticated={isAuthenticated}
            />
          </article>
        </div>

        <aside className="space-y-6">
          <EventMeta event={event} />
          
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Participants ({event.participants.length})
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {event.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 rounded-lg border border-transparent bg-gray-50 p-2 transition-colors hover:border-gray-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs">
                    {getInitials(participant.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {participant.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <dialog ref={dialogRef} onClose={() => setShowDeleteModal(false)} className="m-auto rounded-2xl p-0 shadow-2xl backdrop:bg-gray-900/60 backdrop:backdrop-blur-sm">
        <div className="w-full max-w-sm p-8 bg-white">
          <p className="text-lg font-medium text-gray-900 mb-8 leading-relaxed text-center">
            Are you sure you want to delete this event?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="full" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" size="full" isLoading={actionState.isLoading} onClick={handleDelete}>Yes, Delete</Button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
