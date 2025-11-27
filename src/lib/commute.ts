import { getBatchCommuteTimes, getNextDepartureTime } from "./google-maps";
import prisma from "./db";
import type { Listing } from "@prisma/client";

interface CommuteData {
  commuteToMin: number;
  commuteFromMin: number;
  avgCommuteMin: number;
}

/**
 * Calculate commute times for a list of listings to a destination
 * Uses caching to minimize API calls
 */
export async function calculateCommutesForListings(
  listings: Listing[],
  destinationLat: number,
  destinationLng: number,
  departureTime: string = "08:00",
  returnTime: string = "17:00"
): Promise<Map<string, CommuteData>> {
  const results = new Map<string, CommuteData>();
  const listingsNeedingCalculation: Listing[] = [];

  // Round coordinates for cache key consistency (4 decimal places ~11m precision)
  const roundedDestLat = Math.round(destinationLat * 10000) / 10000;
  const roundedDestLng = Math.round(destinationLng * 10000) / 10000;

  // Check cache for existing calculations
  for (const listing of listings) {
    const cached = await prisma.commuteCache.findUnique({
      where: {
        listingId_destinationLat_destinationLng_departureTime_returnTime: {
          listingId: listing.id,
          destinationLat: roundedDestLat,
          destinationLng: roundedDestLng,
          departureTime,
          returnTime,
        },
      },
    });

    if (cached) {
      // Check if cache is still fresh (less than 7 days old)
      const cacheAge = Date.now() - cached.calculatedAt.getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (cacheAge < maxAge) {
        results.set(listing.id, {
          commuteToMin: cached.commuteToMin,
          commuteFromMin: cached.commuteFromMin,
          avgCommuteMin: cached.avgCommuteMin,
        });
        continue;
      }
    }

    listingsNeedingCalculation.push(listing);
  }

  if (listingsNeedingCalculation.length === 0) {
    return results;
  }

  // Calculate commute TO destination (morning departure)
  const departureDateTime = getNextDepartureTime(departureTime);
  const toDestOrigins = listingsNeedingCalculation.map((l) => ({
    lat: l.latitude,
    lng: l.longitude,
    id: l.id,
  }));

  const toDestResults = await getBatchCommuteTimes(
    toDestOrigins,
    destinationLat,
    destinationLng,
    departureDateTime
  );

  // Calculate commute FROM destination (evening return)
  const returnDateTime = getNextDepartureTime(returnTime);
  
  // For return trip, destination becomes origin and each listing is the destination
  // We need to reverse the calculation
  const fromDestResults = new Map<string, number | null>();
  
  // Process in batches - for return trip, we query from destination to each listing
  for (const listing of listingsNeedingCalculation) {
    const result = await getBatchCommuteTimes(
      [{ lat: destinationLat, lng: destinationLng, id: "dest" }],
      listing.latitude,
      listing.longitude,
      returnDateTime
    );
    const destResult = result.get("dest");
    fromDestResults.set(listing.id, destResult?.durationMinutes ?? null);
  }

  // Combine results and cache
  for (const listing of listingsNeedingCalculation) {
    const toResult = toDestResults.get(listing.id);
    const fromResult = fromDestResults.get(listing.id);

    if (toResult && fromResult !== null && fromResult !== undefined) {
      const commuteData: CommuteData = {
        commuteToMin: toResult.durationMinutes,
        commuteFromMin: fromResult,
        avgCommuteMin: Math.round((toResult.durationMinutes + fromResult) / 2),
      };

      results.set(listing.id, commuteData);

      // Cache the result
      await prisma.commuteCache.upsert({
        where: {
          listingId_destinationLat_destinationLng_departureTime_returnTime: {
            listingId: listing.id,
            destinationLat: roundedDestLat,
            destinationLng: roundedDestLng,
            departureTime,
            returnTime,
          },
        },
        update: {
          commuteToMin: commuteData.commuteToMin,
          commuteFromMin: commuteData.commuteFromMin,
          avgCommuteMin: commuteData.avgCommuteMin,
          calculatedAt: new Date(),
        },
        create: {
          listingId: listing.id,
          destinationLat: roundedDestLat,
          destinationLng: roundedDestLng,
          departureTime,
          returnTime,
          commuteToMin: commuteData.commuteToMin,
          commuteFromMin: commuteData.commuteFromMin,
          avgCommuteMin: commuteData.avgCommuteMin,
        },
      });
    }
  }

  return results;
}

/**
 * Get cached commute data for a listing
 */
export async function getCachedCommute(
  listingId: string,
  destinationLat: number,
  destinationLng: number,
  departureTime: string,
  returnTime: string
): Promise<CommuteData | null> {
  const roundedDestLat = Math.round(destinationLat * 10000) / 10000;
  const roundedDestLng = Math.round(destinationLng * 10000) / 10000;

  const cached = await prisma.commuteCache.findUnique({
    where: {
      listingId_destinationLat_destinationLng_departureTime_returnTime: {
        listingId,
        destinationLat: roundedDestLat,
        destinationLng: roundedDestLng,
        departureTime,
        returnTime,
      },
    },
  });

  if (!cached) return null;

  return {
    commuteToMin: cached.commuteToMin,
    commuteFromMin: cached.commuteFromMin,
    avgCommuteMin: cached.avgCommuteMin,
  };
}

