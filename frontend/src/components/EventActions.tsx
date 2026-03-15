import { Pencil, Trash2 } from "lucide-react";
import Button from "./Button";

interface EventActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOrganizer: boolean;
}

export default function EventActions({
  onEdit,
  onDelete,
  isLoading,
  isAuthenticated,
  isOrganizer,
}: EventActionsProps) {
  if (!isAuthenticated || !isOrganizer) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button 
        onClick={onEdit} 
        variant="outline" 
        size="md"
        leftIcon={<Pencil className="h-4 w-4" />}
      >
        Edit
      </Button>
      <Button
        onClick={onDelete}
        variant="danger"
        size="md"
        isLoading={isLoading}
        leftIcon={<Trash2 className="h-4 w-4" />}
      >
        Delete
      </Button>
    </div>
  );
}
