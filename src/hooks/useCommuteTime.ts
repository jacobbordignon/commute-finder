"use client";

import { useState, useCallback } from "react";
import { useSearchStore } from "@/store/searchStore";

interface CommuteTimeResult {
  commuteToMin: number;
  commuteFromMin: number;
  avgCommuteMin: number;
}

export function useCommuteTime() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    destinationLat,
    destinationLng,
    departureTime,
    returnTime,
  } = useSearchStore();

  const calculateCommute = useCallback(
    async (
      listingId: string,
      originLat: number,
      originLng: number
    ): Promise<CommuteTimeResult | null> => {
      if (!destinationLat || !destinationLng) {
        setError("No destination set");
        return null;
      }

      setIsCalculating(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          listingId,
          originLat: originLat.toString(),
          originLng: originLng.toString(),
          destLat: destinationLat.toString(),
          destLng: destinationLng.toString(),
          departureTime,
          returnTime,
        });

        const response = await fetch(`/api/commute?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to calculate commute time");
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error calculating commute:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      } finally {
        setIsCalculating(false);
      }
    },
    [destinationLat, destinationLng, departureTime, returnTime]
  );

  return {
    calculateCommute,
    isCalculating,
    error,
  };
}

