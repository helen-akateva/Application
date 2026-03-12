import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import type { EventVisibility, Tag } from "../types";
import { createTag } from "../api/tags";
import { AxiosError } from "axios";
import type { ApiError } from "../types";

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

import Button from "./Button";

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
  const [localTags, setLocalTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagError, setTagError] = useState("");

  useEffect(() => {
    setLocalTags(availableTags);
  }, [availableTags]);

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

  const handleCreateTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    const current = formik.values.tagIds ?? [];
    if (current.length >= 5) {
      setTagError("Maximum 5 tags allowed");
      return;
    }

    const existing = localTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      if (!current.includes(existing.id)) {
        formik.setFieldValue("tagIds", [...current, existing.id]);
      }
      setNewTagName("");
      setTagError("");
      return;
    }

    setIsCreatingTag(true);
    setTagError("");
    try {
      const newTag = await createTag(trimmed);
      setLocalTags((prev) => [...prev, newTag]);
      formik.setFieldValue("tagIds", [...current, newTag.id]);
      setNewTagName("");
      onTagCreated?.(newTag);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setTagError(axiosError.response?.data?.message || "Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

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
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              id="date"
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
            <label htmlFor="time" className="text-sm font-medium text-gray-700">
              Time *
            </label>
            <input
              id="time"
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
        <fieldset className="space-y-3 pt-2">
          <legend className="mb-2 text-sm font-bold text-gray-900">
            Visibility
          </legend>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formik.values.visibility === "public"}
                onChange={formik.handleChange}
                className="mt-1 h-4 w-4 accent-green-600"
              />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700 font-medium">
                  Public - Anyone can see and join this event
                </span>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={formik.values.visibility === "private"}
                onChange={formik.handleChange}
                className="mt-1 h-4 w-4 accent-green-600"
              />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700 font-medium">
                  Private - Only invited people can see this event
                </span>
              </div>
            </label>
          </div>
        </fieldset>
        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Tags{" "}
            <span className="text-gray-400 font-normal">(optional, max 5)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {localTags.map((tag) => {
              const isSelected = formik.values.tagIds?.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const current = formik.values.tagIds ?? [];
                    if (isSelected) {
                      formik.setFieldValue(
                        "tagIds",
                        current.filter((id) => id !== tag.id),
                      );
                    } else if (current.length < 5) {
                      formik.setFieldValue("tagIds", [...current, tag.id]);
                    }
                  }}
                  className={`rounded-full px-3 py-1 text-sm font-medium border transition-all ${
                    isSelected
                      ? "text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: tag.color ?? "#6b7280",
                          borderColor: tag.color ?? "#6b7280",
                        }
                      : {}
                  }
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Add new tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100"
              disabled={
                isCreatingTag || (formik.values.tagIds?.length ?? 0) >= 5
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateTag}
              isLoading={isCreatingTag}
              disabled={
                (formik.values.tagIds?.length ?? 0) >= 5 || !newTagName.trim()
              }
            >
              Add
            </Button>
          </div>

          {(formik.values.tagIds?.length ?? 0) >= 5 && (
            <p className="text-xs text-amber-500">Maximum 5 tags selected</p>
          )}
          {tagError && <p className="text-xs text-red-500">{tagError}</p>}
        </div>

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
