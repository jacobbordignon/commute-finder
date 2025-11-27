"use client";

import { useEffect, useRef } from "react";
import { Home, Loader2, SearchX } from "lucide-react";
import { ListingCard } from "./ListingCard";
import { useSearchStore } from "@/store/searchStore";
import { useListings } from "@/hooks/useListings";
import { SORT_OPTIONS } from "@/types/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ListingList() {
  const listRef = useRef<HTMLDivElement>(null);
  const { listings, isLoading, error } = useListings();
  const {
    destinationLat,
    sortBy,
    setSortBy,
    selectedListingId,
  } = useSearchStore();

  // Scroll to selected listing
  useEffect(() => {
    if (selectedListingId && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-listing-id="${selectedListingId}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedListingId]);

  // No destination set
  if (!destinationLat) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Home className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Find Your Perfect Rental</h3>
        <p className="text-slate-500 text-sm max-w-[250px]">
          Enter your school or work address above to discover nearby rentals with commute times.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Searching for rentals...</p>
        <p className="text-slate-400 text-sm mt-1">
          Calculating commute times
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Something went wrong</h3>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  // No results
  if (listings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">No rentals found</h3>
        <p className="text-slate-500 text-sm max-w-[250px]">
          Try expanding your search radius or adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div>
          <h2 className="font-semibold text-slate-900">
            {listings.length} Rental{listings.length !== 1 ? "s" : ""} Found
          </h2>
          <p className="text-sm text-slate-500">
            Sorted by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label.toLowerCase()}
          </p>
        </div>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listing cards */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {listings.map((listing) => (
          <div key={listing.id} data-listing-id={listing.id}>
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}

