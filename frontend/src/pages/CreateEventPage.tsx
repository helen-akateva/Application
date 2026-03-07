import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";
import { createEvent } from "../api/events";
import { AxiosError } from "axios";
import type { ApiError } from "../types";

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup.string().required("Description is required"),
  date: yup.string().required("Date is required"),
  time: yup.string().required("Time is required"),
  location: yup.string().required("Location is required"),
  capacity: yup
    .number()
    .nullable()
    .min(1, "Capacity must be at least 1")
    .transform((value, original) => (original === "" ? null : value)),
  visibility: yup.string().oneOf(["public", "private"]).required(),
});

export default function CreateEventPage() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      capacity: "",
      visibility: "public" as "public" | "private",
    },
    validationSchema,
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (values.date && values.time) {
        const selectedDate = new Date(`${values.date}T${values.time}`);
        if (selectedDate <= new Date()) {
          errors.date = "Event cannot be in the past";
        }
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const isoDate = new Date(`${values.date}T${values.time}`).toISOString();

        const payload = {
          title: values.title,
          description: values.description || undefined,
          date: isoDate,
          location: values.location,
          capacity: values.capacity ? Number(values.capacity) : undefined,
          visibility: values.visibility,
        };

        const event = await createEvent(payload);
        navigate(`/events/${event.id}`);
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        setStatus(axiosError.response?.data?.message || "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const today = new Date().toISOString().split("T")[0];
  const minTime =
    formik.values.date === today
      ? new Date().toTimeString().slice(0, 5)
      : undefined;

  const getInputClass = (field: keyof typeof formik.values) => {
    const isError = formik.touched[field] && formik.errors[field];
    return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
      isError
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 focus:border-green-500 focus:ring-green-100"
    }`;
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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Create New Event
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Fill in the details to publish your event to the community
          </p>
        </header>

        {formik.status && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium"
          >
            {formik.status}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Event Title{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Tech Conference 2025"
              aria-invalid={formik.touched.title && !!formik.errors.title}
              aria-describedby={formik.errors.title ? "title-error" : undefined}
              {...formik.getFieldProps("title")}
              className={getInputClass("title")}
            />
            {formik.touched.title && formik.errors.title && (
              <p id="title-error" role="alert" className="text-xs text-red-500">
                {formik.errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="What is this event about?"
              aria-invalid={
                formik.touched.description && !!formik.errors.description
              }
              aria-describedby={
                formik.errors.description ? "desc-error" : undefined
              }
              {...formik.getFieldProps("description")}
              className={`${getInputClass("description")} resize-none`}
            />
            {formik.touched.description && formik.errors.description && (
              <p id="desc-error" role="alert" className="text-xs text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="date"
                className="text-sm font-medium text-gray-700"
              >
                {" "}
                Date *{" "}
              </label>
              <input
                id="date"
                type="date"
                min={today}
                {...formik.getFieldProps("date")}
                className={`${getInputClass("date")} cursor-pointer`}
              />
              {formik.touched.date && formik.errors.date && (
                <p role="alert" className="text-xs text-red-500">
                  {formik.errors.date}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="time"
                className="text-sm font-medium text-gray-700"
              >
                {" "}
                Time *{" "}
              </label>
              <input
                id="time"
                type="time"
                min={minTime}
                {...formik.getFieldProps("time")}
                className={`${getInputClass("time")} cursor-pointer`}
              />
              {formik.touched.time && formik.errors.time && (
                <p role="alert" className="text-xs text-red-500">
                  {formik.errors.time}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="location"
              className="text-sm font-medium text-gray-700"
            >
              {" "}
              Location *{" "}
            </label>
            <input
              id="location"
              type="text"
              placeholder="Online or Physical address"
              {...formik.getFieldProps("location")}
              className={getInputClass("location")}
            />
            {formik.touched.location && formik.errors.location && (
              <p role="alert" className="text-xs text-red-500">
                {formik.errors.location}
              </p>
            )}
          </div>

          {/* Capacity */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="capacity"
              className="text-sm font-medium text-gray-700"
            >
              {" "}
              Capacity (optional){" "}
            </label>
            <input
              id="capacity"
              type="number"
              aria-describedby="capacity-hint"
              placeholder="e.g. 100"
              {...formik.getFieldProps("capacity")}
              className={getInputClass("capacity")}
            />
            <p id="capacity-hint" className="text-xs text-gray-400">
              Leave empty for unlimited participants
            </p>
          </div>

          {/* Visibility Fieldset */}
          <fieldset className="space-y-3 pt-2">
            <legend className="mb-2 text-sm font-bold text-gray-900">
              Event Visibility
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                htmlFor="public"
                className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
              >
                <input
                  id="public"
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formik.values.visibility === "public"}
                  onChange={formik.handleChange}
                  className="h-4 w-4 accent-green-600"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Public
                </span>
              </label>
              <label
                htmlFor="private"
                className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
              >
                <input
                  id="private"
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formik.values.visibility === "private"}
                  onChange={formik.handleChange}
                  className="h-4 w-4 accent-green-600"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Private
                </span>
              </label>
            </div>
          </fieldset>

          {/* Form Actions */}
          <footer className="flex flex-col gap-3 pt-6 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
            >
              {formik.isSubmitting ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}
