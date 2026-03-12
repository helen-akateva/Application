import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { createEvent } from "../api/events";
import { fetchTags } from "../api/tags";
import { AxiosError } from "axios";
import type { ApiError, Tag } from "../types";
import EventForm, { type EventFormValues } from "../components/EventForm";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags()
      .then(setAvailableTags)
      .catch(() => {});
  }, []);

  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    setStatus(undefined);
    try {
      const isoDate = new Date(`${values.date}T${values.time}`).toISOString();
      const payload = {
        title: values.title,
        description: values.description || undefined,
        date: isoDate,
        location: values.location,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        visibility: values.visibility,
        tagIds: values.tagIds,
      };
      const event = await createEvent(payload);
      navigate(`/events/${event.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const data = axiosError.response?.data;
      if (data?.errors?.length) {
        setStatus(data.errors.join(", "));
      } else {
        setStatus(data?.message || "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to events
        </Link>
      </nav>
      <section className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Create New Event
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Fill in the details to publish your event to the community
        </p>
      </section>
      <EventForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/")}
        submitLabel="Create Event"
        isSubmitting={isSubmitting}
        status={status}
        availableTags={availableTags}
        onTagCreated={(tag) => setAvailableTags((prev) => [...prev, tag])}
      />
    </main>
  );
}
