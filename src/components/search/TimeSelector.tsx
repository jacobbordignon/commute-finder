"use client";

import { Clock, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSearchStore } from "@/store/searchStore";
import { cn } from "@/lib/utils";

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function TimeSelector() {
  const {
    departureTime,
    returnTime,
    setDepartureTime,
    setReturnTime,
  } = useSearchStore();

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-neutral-500" />
        <h3 className="font-medium text-neutral-700 text-sm">Commute Times</h3>
      </div>

      <div className="flex items-center gap-3">
        {/* Departure Time */}
        <div className="flex-1">
          <Label className="text-xs text-neutral-500 mb-1.5 block">Depart</Label>
          <select
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className={cn(
              "w-full h-9 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm",
              "transition-colors focus:border-neutral-400 focus:bg-white",
              "focus:outline-none"
            )}
          >
            {TIME_OPTIONS.filter((t) => {
              const hour = parseInt(t.split(":")[0]);
              return hour >= 6 && hour <= 12;
            }).map((time) => (
              <option key={time} value={time}>
                {formatTime(time)}
              </option>
            ))}
          </select>
        </div>

        <ArrowRight className="h-4 w-4 text-neutral-300 mt-5" />

        {/* Return Time */}
        <div className="flex-1">
          <Label className="text-xs text-neutral-500 mb-1.5 block">Return</Label>
          <select
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className={cn(
              "w-full h-9 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm",
              "transition-colors focus:border-neutral-400 focus:bg-white",
              "focus:outline-none"
            )}
          >
            {TIME_OPTIONS.filter((t) => {
              const hour = parseInt(t.split(":")[0]);
              return hour >= 12 && hour <= 21;
            }).map((time) => (
              <option key={time} value={time}>
                {formatTime(time)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
