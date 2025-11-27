"use client";

import { useCallback, useEffect } from "react";
import { useSearchStore } from "@/store/searchStore";
import type { ListingWithCommute } from "@/types/listing";
import { calculateValueScore, sortListings } from "@/lib/value-score";

export function useListings() {
  const {
    listings,
    isLoading,
    error,
    sortBy,
    destinationLat,
    destinationLng,
    radiusMiles,
    departureTime,
    returnTime,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes,
    setListings,
    setLoading,
    setError,
  } = useSearchStore();

  const fetchListings = useCallback(async () => {
    if (!destinationLat || !destinationLng) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: destinationLat.toString(),
        lng: destinationLng.toString(),
        radius: radiusMiles.toString(),
        departureTime,
        returnTime,
      });

      if (minPrice > 0) params.set("minPrice", minPrice.toString());
      if (maxPrice < 10000) params.set("maxPrice", maxPrice.toString());
      if (minBedrooms > 0) params.set("minBedrooms", minBedrooms.toString());
      if (maxBedrooms < 10) params.set("maxBedrooms", maxBedrooms.toString());
      if (propertyTypes.length > 0) {
        params.set("propertyTypes", propertyTypes.join(","));
      }

      const response = await fetch(`/api/listings?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();

      // Calculate value scores for all listings
      const listingsWithScores: ListingWithCommute[] = data.listings.map(
        (listing: ListingWithCommute) => ({
          ...listing,
          valueScore: listing.avgCommuteMin !== null 
            ? calculateValueScore(listing)
            : null,
        })
      );

      setListings(listingsWithScores);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    destinationLat,
    destinationLng,
    radiusMiles,
    departureTime,
    returnTime,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes,
    setListings,
    setLoading,
    setError,
  ]);

  // Get sorted listings
  const sortedListings = sortListings(listings, sortBy);

  // Filter listings client-side for instant UI feedback
  const filteredListings = sortedListings.filter((listing) => {
    if (listing.price < minPrice || listing.price > maxPrice) return false;
    if (listing.bedrooms < minBedrooms || listing.bedrooms > maxBedrooms) return false;
    if (propertyTypes.length > 0 && !propertyTypes.includes(listing.propertyType)) {
      return false;
    }
    return true;
  });

  return {
    listings: filteredListings,
    allListings: listings,
    isLoading,
    error,
    fetchListings,
    refetch: fetchListings,
  };
}

/**
 * Hook to trigger listing fetch when destination changes
 */
export function useAutoFetchListings() {
  const { destinationLat, destinationLng } = useSearchStore();
  const { fetchListings } = useListings();

  useEffect(() => {
    if (destinationLat && destinationLng) {
      fetchListings();
    }
  }, [destinationLat, destinationLng, fetchListings]);
}

