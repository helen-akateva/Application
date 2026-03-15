import { Calendar, Clock, MapPin, Users, User } from "lucide-react";
import { format } from "date-fns";
import type { EventDetails } from "../types";

interface EventMetaProps {
  event: EventDetails;
}

export default function EventMeta({ event }: EventMetaProps) {
  const eventDate = new Date(event.date);

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <User className="h-4 w-4 text-gray-400" />
        <div>
          <span className="font-medium text-gray-900">Organizer:</span>{" "}
          {event.organizer.name}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Calendar className="h-4 w-4 text-gray-400" />
        <div>
          <span className="font-medium text-gray-900">Date:</span>{" "}
          {format(eventDate, "PPPP")}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Clock className="h-4 w-4 text-gray-400" />
        <div>
          <span className="font-medium text-gray-900">Time:</span>{" "}
          {format(eventDate, "p")}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-gray-400" />
        <div>
          <span className="font-medium text-gray-900">Location:</span>{" "}
          {event.location}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Users className="h-4 w-4 text-gray-400" />
        <div>
          <span className="font-medium text-gray-900">Capacity:</span>{" "}
          {event.participants.length} /{" "}
          {event.capacity ? event.capacity : "Unlimited"} participants
        </div>
      </div>
    </div>
  );
}
