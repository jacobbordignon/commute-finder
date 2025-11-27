"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/search/LocationInput";
import { FilterPanel } from "@/components/search/FilterPanel";
import { TimeSelector } from "@/components/search/TimeSelector";
import { MapView } from "@/components/map/MapView";
import { ListingList } from "@/components/listings/ListingList";
import { useSearchStore } from "@/store/searchStore";
import { useListings } from "@/hooks/useListings";

export default function ResultsPage() {
  const router = useRouter();
  const { destinationLat, destinationLng, destinationAddress } = useSearchStore();
  const { fetchListings } = useListings();

  // Fetch listings when destination changes
  useEffect(() => {
    if (destinationLat && destinationLng) {
      fetchListings();
    }
  }, [destinationLat, destinationLng, fetchListings]);

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

