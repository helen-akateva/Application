import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import type { EventVisibility, Tag } from "../types";
import TagSelector from "./TagSelector";
import Button from "./Button";

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup.string().optional(),
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

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: string;
  visibility: EventVisibility;
  tagIds: number[];
}



interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  submitLabel: string;
  isSubmitting: boolean;
  status?: string;
  onCancel: () => void;
  availableTags: Tag[];
  onTagCreated?: (tag: Tag) => void;
}

export default function EventForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  status,
  onCancel,
  availableTags,
  onTagCreated,
}: EventFormProps) {
  const [extraTags, setExtraTags] = useState<Tag[]>([]);

  const localTags = [...availableTags, ...extraTags];

  const formik = useFormik<EventFormValues>({
    initialValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      date: initialValues?.date || "",
      time: initialValues?.time || "",
      location: initialValues?.location || "",
      capacity: initialValues?.capacity || "",
      visibility: initialValues?.visibility || "public",
      tagIds: initialValues?.tagIds ?? [],
    },
    validationSchema,
    enableReinitialize: true,
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
    onSubmit: (values) => {
      onSubmit(values);
    },
  });



  const today = new Date().toISOString().split("T")[0];
  const minTime =
    formik.values.date === today && !initialValues?.title
      ? new Date().toTimeString().slice(0, 5)
      : undefined;

  const getInputClass = (field: keyof EventFormValues) => {
  const isError = formik.touched[field] && formik.errors[field];
    
    return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
      isError
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 focus:border-green-500 focus:ring-green-100"
    }`;
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {status && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium"
        >
          {status}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Tech Conference 2025"
            {...formik.getFieldProps("title")}
            className={getInputClass("title")}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-xs text-red-500">{formik.errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe what makes your event special..."
            {...formik.getFieldProps("description")}
            className={`${getInputClass("description")} resize-none`}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-xs text-red-500">{formik.errors.description}</p>
          )}
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-date" className="text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              id="event-date"
              type="date"
              min={!initialValues?.title ? today : undefined}
              {...formik.getFieldProps("date")}
              className={`${getInputClass("date")} cursor-pointer`}
            />
            {formik.touched.date && formik.errors.date && (
              <p className="text-xs text-red-500">{formik.errors.date}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-time" className="text-sm font-medium text-gray-700">
              Time *
            </label>
            <input
              id="event-time"
              type="time"
              min={minTime}
              {...formik.getFieldProps("time")}
              className={`${getInputClass("time")} cursor-pointer`}
            />
            {formik.touched.time && formik.errors.time && (
              <p className="text-xs text-red-500">{formik.errors.time}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="location"
            className="text-sm font-medium text-gray-700"
          >
            Location *
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g., Convention Center, San Francisco"
            {...formik.getFieldProps("location")}
            className={getInputClass("location")}
          />
          {formik.touched.location && formik.errors.location && (
            <p className="text-xs text-red-500">{formik.errors.location}</p>
          )}
        </div>

        {/* Capacity */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="capacity"
            className="text-sm font-medium text-gray-700"
          >
            Capacity (optional)
          </label>
          <input
            id="capacity"
            type="number"
            placeholder="Leave empty for unlimited"
            {...formik.getFieldProps("capacity")}
            className={getInputClass("capacity")}
          />
          <p className="text-xs text-gray-400">
            Maximum number of participants. Leave empty for unlimited capacity.
          </p>
        </div>

        {/* Visibility */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="radio"
              id="visibility-public"
              name="visibility"
              value="public"
              checked={formik.values.visibility === "public"}
              onChange={() => formik.setFieldValue("visibility", "public")}
              className="peer sr-only"
            />
            <label
              htmlFor="visibility-public"
              className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white p-4 font-semibold text-gray-500 transition-all hover:bg-gray-50 peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-700"
            >
              Public
            </label>
          </div>

          <div className="relative">
            <input
              type="radio"
              id="visibility-private"
              name="visibility"
              value="private"
              checked={formik.values.visibility === "private"}
              onChange={() => formik.setFieldValue("visibility", "private")}
              className="peer sr-only"
            />
            <label
              htmlFor="visibility-private"
              className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white p-4 font-semibold text-gray-500 transition-all hover:bg-gray-50 peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-700"
            >
              Private
            </label>
          </div>
        </div>
        {/* Tags */}
        <TagSelector
          availableTags={localTags}
          selectedTagIds={formik.values.tagIds ?? []}
          onChange={(tagIds: number[]) => formik.setFieldValue("tagIds", tagIds)}
          onTagCreated={(tag: Tag) => {
            setExtraTags((prev) => [...prev, tag]);
            onTagCreated?.(tag);
          }}
        />


        {/* Form Actions */}
        <footer className="flex gap-4 pt-6">
          <Button variant="outline" size="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="full" isLoading={isSubmitting}>
            {submitLabel}
          </Button>
        </footer>
      </form>
    </section>
  );
}
