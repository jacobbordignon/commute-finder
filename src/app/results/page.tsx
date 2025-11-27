"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/search/LocationInput";
import { FilterPanel } from "@/components/search/FilterPanel";
import { TimeSelector } from "@/components/search/TimeSelector";
import { ListingList } from "@/components/listings/ListingList";
import { useSearchStore } from "@/store/searchStore";
import { useListings } from "@/hooks/useListings";
import dynamic from "next/dynamic";

// Dynamically import MapView to avoid SSR issues with Google Maps
const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-lg">
        <div className="flex items-center gap-2 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

export default function ResultsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { destinationLat, destinationLng, destinationAddress } = useSearchStore();
  const { fetchListings } = useListings();

  // Ensure component is mounted before rendering (hydration fix)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch listings when destination changes
  useEffect(() => {
    if (destinationLat && destinationLng) {
      fetchListings();
    }
  }, [destinationLat, destinationLng, fetchListings]);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="flex-shrink-0 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 max-w-xl">
            <LocationInput />
          </div>

          {destinationAddress && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-500">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-xs">{destinationAddress}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Filters and listings */}
        <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-white border-r border-neutral-200">
          {/* Filters */}
          <div className="p-4 space-y-4 border-b border-neutral-100">
            <TimeSelector />
            <FilterPanel />
          </div>

          {/* Listings */}
          <div className="flex-1 overflow-hidden">
            <ListingList />
          </div>
        </div>

        {/* Map */}
        <div className="hidden md:block flex-1 p-3">
          <MapView />
        </div>
      </div>
    </div>
  );
}
