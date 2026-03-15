import { useState } from "react";
import type { Tag, ApiError } from "../types";
import { createTag } from "../api/tags";
import { AxiosError } from "axios";
import Button from "./Button";

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  onTagCreated?: (tag: Tag) => void;
  maxTags?: number;
}

export default function TagSelector({
  availableTags,
  selectedTagIds,
  onChange,
  onTagCreated,
  maxTags = 5,
}: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagError, setTagError] = useState("");

  const handleCreateTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    if (selectedTagIds.length >= maxTags) {
      setTagError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    const existing = availableTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) {
        onChange([...selectedTagIds, existing.id]);
      }
      setNewTagName("");
      setTagError("");
      return;
    }

    setIsCreatingTag(true);
    setTagError("");
    try {
      const newTag = await createTag(trimmed);
      onTagCreated?.(newTag);
      onChange([...selectedTagIds, newTag.id]);
      setNewTagName("");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setTagError(axiosError.response?.data?.message || "Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        Tags{" "}
        <span className="text-gray-400 font-normal">
          (optional, max {maxTags})
        </span>
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onChange(selectedTagIds.filter((id) => id !== tag.id));
                } else if (selectedTagIds.length < maxTags) {
                  onChange([...selectedTagIds, tag.id]);
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
          disabled={isCreatingTag || selectedTagIds.length >= maxTags}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCreateTag}
          isLoading={isCreatingTag}
          disabled={selectedTagIds.length >= maxTags || !newTagName.trim()}
        >
          Add
        </Button>
      </div>

      {selectedTagIds.length >= maxTags && (
        <p className="text-xs text-amber-500">
          Maximum {maxTags} tags selected
        </p>
      )}
      {tagError && <p className="text-xs text-red-500">{tagError}</p>}
    </div>
  );
}
