import { LogIn, LogOut, Edit, Trash2 } from "lucide-react";
import Button from "./Button";

interface EventActionsProps {
  isJoined: boolean;
  isOrganizer: boolean;
  onJoinLeave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export default function EventActions({
  isJoined,
  isOrganizer,
  onJoinLeave,
  onEdit,
  onDelete,
  isLoading,
  isAuthenticated,
}: EventActionsProps) {
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {isOrganizer ? (
        <>
          <Button onClick={onEdit} variant="outline" className="flex-1 sm:flex-none">
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
          <Button
            onClick={onDelete}
            variant="danger"
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Event
          </Button>
        </>
      ) : (
        <Button
          onClick={onJoinLeave}
          variant={isJoined ? "outline" : "primary"}
          isLoading={isLoading}
          className="w-full sm:w-auto min-w-[140px]"
        >
          {isJoined ? (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Leave Event
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Join Event
            </>
          )}
        </Button>
      )}
    </div>
  );
}
