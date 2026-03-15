import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns";
import { useAuthStore } from "../store/authStore";
import { fetchUserEvents } from "../api/events";
import { Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { EventListItem } from "../types";

const MyEventsPage = () => {
  const { user } = useAuthStore();
  const [state, setState] = useState<{
    myEvents: EventListItem[];
    isLoading: boolean;
    loadError: string | null;
    view: "month" | "week";
    currentDate: Date;
  }>({
    myEvents: [],
    isLoading: true,
    loadError: null,
    view: "month",
    currentDate: new Date(),
  });

  const { myEvents, isLoading, loadError, view, currentDate } = state;

  useEffect(() => {
    const loadMyEvents = async () => {
      if (!user) return;
      setState((prev) => ({ ...prev, isLoading: true, loadError: null }));
      try {
        const data = await fetchUserEvents();
        setState((prev) => ({
          ...prev,
          myEvents: data,
          isLoading: false,
        }));
      } catch (err) {
        console.error(err);
        setState((prev) => ({
          ...prev,
          loadError: "Failed to load your events",
          isLoading: false,
        }));
      }
    };

    loadMyEvents();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading your calendar...</span>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="flex justify-center py-20 text-red-500">{loadError}</div>
    );
  }

  if (myEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <Calendar className="w-12 h-12 text-green-500" />
        </div>
        <p className="text-gray-500 text-lg max-w-md">
          You are not part of any events yet. Explore public events and join.
        </p>
        <Link
          to="/"
          className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
        >
          Explore Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 mt-1">
            View and manage your event calendar
          </p>
        </div>
        <Link
          to="/create-event"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all text-center"
        >
          + Create Event
        </Link>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                currentDate:
                  prev.view === "month"
                    ? subMonths(prev.currentDate, 1)
                    : subWeeks(prev.currentDate, 1),
              }))
            }
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border rounded-xl transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mx-2">
            {format(currentDate, "MMMM yyyy")}
          </h2>

          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                currentDate:
                  prev.view === "month"
                    ? addMonths(prev.currentDate, 1)
                    : addWeeks(prev.currentDate, 1),
              }))
            }
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border rounded-xl transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setState((prev) => ({ ...prev, view: "month" }))}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === "month" ? "bg-green-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
          >
            Month
          </button>
          <button
            onClick={() => setState((prev) => ({ ...prev, view: "week" }))}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === "week" ? "bg-green-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
          >
            Week
          </button>
        </div>
      </div>

      {/* View Switcher */}
      {view === "month" ? (
        <MonthView currentDate={currentDate} events={myEvents} />
      ) : (
        <WeekView currentDate={currentDate} events={myEvents} />
      )}
    </div>
  );
};

export default MyEventsPage;

// --- Sub-Components ---

interface ViewProps {
  currentDate: Date;
  events: EventListItem[];
}

const MonthView = ({ currentDate, events }: ViewProps) => {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const today = new Date();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 bg-white border-b border-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = events
            .filter((e) => isSameDay(new Date(e.date), day))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
          const isToday = isSameDay(day, today);
          const isCurrentMonth = format(day, "M") === format(currentDate, "M");
          const dayKey = day.toISOString();

          return (
            <div
              key={dayKey}
              className={`min-h-[80px] p-1 border-r border-b border-gray-100 last:border-r-0 transition-colors hover:bg-gray-50/50 ${!isCurrentMonth ? "bg-gray-50/10" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? "bg-green-600 text-white" : isCurrentMonth ? "text-gray-700" : "text-gray-300"}`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-0.5 max-h-[60px] overflow-y-auto scrollbar-hide">
                {dayEvents.map((e) => (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    className="block px-1 py-0.5 rounded text-[8px] group transition-all truncate font-medium border-l-2"
                    style={{
                      backgroundColor: e.tags?.[0]?.color
                        ? `${e.tags[0].color}15`
                        : "#f0fdf4",
                      borderLeftColor: e.tags?.[0]?.color ?? "#16a34a",
                      color: e.tags?.[0]?.color ?? "#166534",
                    }}
                  >
                    {format(new Date(e.date), "HH:mm")} {e.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView = ({ currentDate, events }: ViewProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => {
      return new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    });
  }, [currentDate]);

  const today = new Date();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
      {weekDays.map((day) => {
        const dayEvents = events
          .filter((e) => isSameDay(new Date(e.date), day))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
        const isToday = isSameDay(day, today);

        return (
          <div
            key={day.toISOString()}
            className={`flex flex-col rounded-xl border bg-white overflow-hidden transition-all min-h-[140px] ${
              isToday
                ? "border-green-600 ring-1 ring-green-600 ring-opacity-30 shadow-md"
                : "border-gray-100"
            }`}
          >
            <div className="p-2 text-left border-b border-gray-50">
              <div
                className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${
                  isToday ? "text-green-600" : "text-gray-900"
                }`}
              >
                {format(day, "EEE")}
              </div>
              <div
                className={`text-lg font-bold ${
                  isToday ? "text-green-600" : "text-gray-900"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
            <div className="flex-1 p-2 space-y-1.5 bg-white">
              {dayEvents.length > 0 ? (
                dayEvents.map((e) => (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    className="block p-2 rounded-lg transition-all group border"
                    style={{
                      backgroundColor: e.tags?.[0]?.color
                        ? `${e.tags[0].color}15`
                        : "#f0fdf4",
                      borderColor: e.tags?.[0]?.color
                        ? `${e.tags[0].color}40`
                        : "#dcfce7",
                    }}
                  >
                    <div
                      className="text-[9px] font-bold mb-0.5"
                      style={{ color: e.tags?.[0]?.color ?? "#16a34a" }}
                    >
                      {format(new Date(e.date), "HH:mm")}
                    </div>
                    <div className="text-[10px] font-bold text-gray-800 leading-tight line-clamp-1">
                      {e.title}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-gray-300 italic text-[10px]">
                  No events
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
