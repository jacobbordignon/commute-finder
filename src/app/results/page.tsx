"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="flex items-center gap-2 text-slate-600">
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
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 max-w-2xl">
            <LocationInput />
          </div>

          {destinationAddress && (
            <div className="hidden lg:block text-sm text-slate-500">
              Searching near <span className="font-medium text-slate-700">{destinationAddress}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Filters and listings */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col bg-white border-r border-slate-200">
          {/* Filters */}
          <div className="p-4 space-y-4 border-b border-slate-100">
            <TimeSelector />
            <FilterPanel />
          </div>

          {/* Listings */}
          <div className="flex-1 overflow-hidden">
            <ListingList />
          </div>
        </div>

        {/* Map */}
        <div className="hidden md:block flex-1 p-4">
          <MapView />
        </div>
      </div>
    </div>
  );
}

