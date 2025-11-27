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
        <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <Home className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="font-medium text-neutral-800 mb-2">Find Your Rental</h3>
        <p className="text-neutral-500 text-sm max-w-[240px]">
          Enter your destination above to see nearby rentals with commute times.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="h-6 w-6 text-neutral-400 animate-spin mb-4" />
        <p className="text-neutral-600 text-sm">Searching for rentals...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <SearchX className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="font-medium text-neutral-800 mb-2">Something went wrong</h3>
        <p className="text-neutral-500 text-sm">{error}</p>
      </div>
    );
  }

  // No results
  if (listings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <SearchX className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="font-medium text-neutral-800 mb-2">No rentals found</h3>
        <p className="text-neutral-500 text-sm max-w-[240px]">
          Try expanding your search radius or adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div>
          <span className="font-medium text-neutral-800 text-sm">
            {listings.length} rental{listings.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listing cards */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {listings.map((listing) => (
          <div key={listing.id} data-listing-id={listing.id}>
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}
