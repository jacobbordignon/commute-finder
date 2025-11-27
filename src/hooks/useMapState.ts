"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";
import type { ListingWithCommute } from "@/types/listing";

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useMapState() {
  const [zoom, setZoom] = useState(12);
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  const {
    destinationLat,
    destinationLng,
    selectedListingId,
    hoveredListingId,
    setSelectedListing,
    setHoveredListing,
    listings,
  } = useSearchStore();

  // Calculate map center based on destination or listings
  const center = useMemo(() => {
    if (destinationLat && destinationLng) {
      return { lat: destinationLat, lng: destinationLng };
    }

    // Fall back to center of listings
    if (listings.length > 0) {
      const avgLat = listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length;
      const avgLng = listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length;
      return { lat: avgLat, lng: avgLng };
    }

    // Default to US center
    return { lat: 39.8283, lng: -98.5795 };
  }, [destinationLat, destinationLng, listings]);

  // Calculate bounds that fit all listings
  const fitBounds = useCallback((listingsToFit: ListingWithCommute[]) => {
    if (listingsToFit.length === 0) return null;

    const lats = listingsToFit.map((l) => l.latitude);
    const lngs = listingsToFit.map((l) => l.longitude);

    // Include destination in bounds
    if (destinationLat && destinationLng) {
      lats.push(destinationLat);
      lngs.push(destinationLng);
    }

    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01,
    };
  }, [destinationLat, destinationLng]);

  // Get the currently selected listing
  const selectedListing = useMemo(() => {
    if (!selectedListingId) return null;
    return listings.find((l) => l.id === selectedListingId) || null;
  }, [listings, selectedListingId]);

  // Get the currently hovered listing
  const hoveredListing = useMemo(() => {
    if (!hoveredListingId) return null;
    return listings.find((l) => l.id === hoveredListingId) || null;
  }, [listings, hoveredListingId]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (listingId: string) => {
      setSelectedListing(selectedListingId === listingId ? null : listingId);
    },
    [selectedListingId, setSelectedListing]
  );

  // Handle marker hover
  const handleMarkerHover = useCallback(
    (listingId: string | null) => {
      setHoveredListing(listingId);
    },
    [setHoveredListing]
  );

  // Pan to a specific listing
  const panToListing = useCallback((listing: ListingWithCommute) => {
    // This would be implemented with the map ref
    // For now, just select it
    setSelectedListing(listing.id);
  }, [setSelectedListing]);

  return {
    center,
    zoom,
    setZoom,
    bounds,
    setBounds,
    fitBounds,
    selectedListing,
    hoveredListing,
    handleMarkerClick,
    handleMarkerHover,
    panToListing,
    destinationLat,
    destinationLng,
  };
}

