import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchEventById, updateEvent } from "../api/events";
import { fetchTags } from "../api/tags";
import { AxiosError } from "axios";
import type { ApiError, EventDetails, Tag } from "../types";
import EventForm, { type EventFormValues } from "../components/EventForm";
import { useAuthStore } from "../store/authStore";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const [data, tags] = await Promise.all([
          fetchEventById(Number(id)),
          fetchTags(),
        ]);
        if (data.organizer.id !== user?.id) {
          navigate(`/events/${id}`);
          return;
        }
        setEvent(data);
        setAvailableTags(tags);
      } catch {
        setError("Event not found or server error");
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id, user, navigate]);

  const handleSubmit = async (values: EventFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    setStatus(undefined);
    try {
      const isoDate = new Date(`${values.date}T${values.time}`).toISOString();
      const payload = {
        title: values.title,
        description: values.description,
        date: isoDate,
        location: values.location,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        visibility: values.visibility,
        tagIds: values.tagIds,
      };
      await updateEvent(Number(id), payload);
      navigate(`/events/${id}`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const data = axiosError.response?.data;
      if (data?.errors?.length) {
        setStatus(data.errors.join(", "));
      } else {
        setStatus(data?.message || "Failed to update event");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading event data...
      </div>
    );

  if (error || !event)
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error || "Event not found"}</p>
        <Link to="/" className="text-green-600 hover:underline">
          Return to Home
        </Link>
      </main>
    );

  const eventDate = new Date(event.date);
  const initialValues: EventFormValues = {
    title: event.title,
    description: event.description,
    date: eventDate.toISOString().split("T")[0],
    time: eventDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    location: event.location,
    capacity: event.capacity?.toString() || "",
    visibility: event.visibility,
    tagIds: event.tags?.map((t) => t.id) ?? [],
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to event details
        </Link>
      </nav>
      <section className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Edit Event
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Update the details of your event
        </p>
      </section>
      <EventForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/events/${id}`)}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        status={status}
        availableTags={availableTags}
        onTagCreated={(tag) => setAvailableTags((prev) => [...prev, tag])}
      />
    </main>
  );
}
