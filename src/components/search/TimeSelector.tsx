"use client";

import { Clock, Sun, Moon } from "lucide-react";
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
    <div className="bg-white rounded-xl border-2 border-slate-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-emerald-600" />
        <h3 className="font-medium text-slate-900">Commute Times</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Departure Time */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <Label className="text-sm">Leave Home</Label>
          </div>
          <select
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className={cn(
              "w-full h-10 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm",
              "shadow-sm transition-all duration-200 focus:border-emerald-500",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
          <p className="text-xs text-slate-500 mt-1">
            When you leave for class
          </p>
        </div>

        {/* Return Time */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="h-4 w-4 text-indigo-500" />
            <Label className="text-sm">Leave School</Label>
          </div>
          <select
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className={cn(
              "w-full h-10 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm",
              "shadow-sm transition-all duration-200 focus:border-emerald-500",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
          <p className="text-xs text-slate-500 mt-1">
            When you head home
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Times are used to estimate real traffic conditions
      </p>
    </div>
  );
}

