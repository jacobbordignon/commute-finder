"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/search/LocationInput";
import { useSearchStore } from "@/store/searchStore";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { destinationLat, destinationLng } = useSearchStore();

  // Navigate to results when destination is set
  useEffect(() => {
    if (destinationLat && destinationLng) {
      router.push("/results");
    }
  }, [destinationLat, destinationLng, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Simple header */}
      <header className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-800">commute finder</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Headline */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-3 tracking-tight">
              Find rentals by commute time
            </h1>
            <p className="text-neutral-500 text-lg">
              Search apartments based on how long it takes to get to school or work.
            </p>
          </div>

          {/* Search box */}
          <div className="animate-slide-up delay-100">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
              <label className="block text-sm font-medium text-neutral-600 mb-3">
                Where do you commute to?
              </label>
              <LocationInput />
            </div>
          </div>

          {/* Subtle info */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-neutral-400 animate-slide-up delay-200">
            <span>Enter any address</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>See nearby rentals</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>Compare commute times</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-sm text-neutral-400">
          Rental data powered by RentCast • Commute times by Google Maps
        </p>
      </footer>
    </div>
  );
}
