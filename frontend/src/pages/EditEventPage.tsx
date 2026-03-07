import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchEventById, updateEvent } from "../api/events";
import { AxiosError } from "axios";
import type { ApiError, EventDetails } from "../types";
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

    useEffect(() => {
        const loadEvent = async () => {
            if (!id) return;
            try {
                const data = await fetchEventById(Number(id));
                if (data.organizer.id !== user?.id) {
                    navigate(`/events/${id}`);
                    return;
                }
                setEvent(data);
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
            };

            await updateEvent(Number(id), payload);
            navigate(`/events/${id}`);
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setStatus(axiosError.response?.data?.message || "Failed to update event");
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
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location,
        capacity: event.capacity?.toString() || "",
        visibility: event.visibility,
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
            />
        </main>
    );
}
