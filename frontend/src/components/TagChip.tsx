import type { Tag } from "../types";

interface TagChipProps {
  tag: Tag;
  size?: "sm" | "md";
}

export const TagChip = ({ tag, size = "sm" }: TagChipProps) => {
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-block rounded-full font-medium ${padding}`}
      style={{
        backgroundColor: tag.color ? `${tag.color}20` : "#e5e7eb",
        color: tag.color ?? "#374151",
        border: `1px solid ${tag.color ?? "#d1d5db"}`,
      }}
    >
      {tag.name}
    </span>
  );
};
