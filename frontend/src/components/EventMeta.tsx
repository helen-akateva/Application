import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type { EventDetails } from "../types";

interface EventMetaProps {
  event: EventDetails;
  participantsCount: number;
}

export default function EventMeta({
  event,
  participantsCount,
}: EventMetaProps) {
  const eventDate = new Date(event.date);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="font-medium text-gray-900">
          {format(eventDate, "EEEE, d MMMM yyyy")}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
          <Clock className="h-5 w-5" />
        </div>
        <div className="font-medium text-gray-900">
          {format(eventDate, "HH:mm")}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="font-medium text-gray-900">{event.location}</div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
          <Users className="h-5 w-5" />
        </div>
        <div className="font-medium text-gray-900">
          {participantsCount} / {event.capacity ? event.capacity : "∞"} joined
        </div>
      </div>
    </div>
  );
}
