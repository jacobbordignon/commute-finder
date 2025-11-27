import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCommuteTime, getNextDepartureTime } from "@/lib/google-maps";
import prisma from "@/lib/db";

const QuerySchema = z.object({
  listingId: z.string().optional(),
  originLat: z.coerce.number().min(-90).max(90),
  originLng: z.coerce.number().min(-180).max(180),
  destLat: z.coerce.number().min(-90).max(90),
  destLng: z.coerce.number().min(-180).max(180),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/).default("08:00"),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/).default("17:00"),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = QuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      listingId,
      originLat,
      originLng,
      destLat,
      destLng,
      departureTime,
      returnTime,
    } = parsed.data;

    // Round coordinates for cache key consistency
    const roundedDestLat = Math.round(destLat * 10000) / 10000;
    const roundedDestLng = Math.round(destLng * 10000) / 10000;

    // Check cache first if listingId provided
    if (listingId) {
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

      if (cached) {
        const cacheAge = Date.now() - cached.calculatedAt.getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (cacheAge < maxAge) {
          return NextResponse.json({
            commuteToMin: cached.commuteToMin,
            commuteFromMin: cached.commuteFromMin,
            avgCommuteMin: cached.avgCommuteMin,
            cached: true,
          });
        }
      }
    }

    // Calculate commute TO destination (morning)
    const departureDateTime = getNextDepartureTime(departureTime);
    const toDestResult = await getCommuteTime(
      originLat,
      originLng,
      destLat,
      destLng,
      departureDateTime
    );

    if (!toDestResult) {
      return NextResponse.json(
        { error: "Could not calculate commute to destination" },
        { status: 400 }
      );
    }

    // Calculate commute FROM destination (evening)
    const returnDateTime = getNextDepartureTime(returnTime);
    const fromDestResult = await getCommuteTime(
      destLat,
      destLng,
      originLat,
      originLng,
      returnDateTime
    );

    if (!fromDestResult) {
      return NextResponse.json(
        { error: "Could not calculate commute from destination" },
        { status: 400 }
      );
    }

    const commuteToMin = toDestResult.durationInTrafficMinutes || toDestResult.durationMinutes;
    const commuteFromMin = fromDestResult.durationInTrafficMinutes || fromDestResult.durationMinutes;
    const avgCommuteMin = Math.round((commuteToMin + commuteFromMin) / 2);

    // Cache the result if listingId provided
    if (listingId) {
      await prisma.commuteCache.upsert({
        where: {
          listingId_destinationLat_destinationLng_departureTime_returnTime: {
            listingId,
            destinationLat: roundedDestLat,
            destinationLng: roundedDestLng,
            departureTime,
            returnTime,
          },
        },
        update: {
          commuteToMin,
          commuteFromMin,
          avgCommuteMin,
          calculatedAt: new Date(),
        },
        create: {
          listingId,
          destinationLat: roundedDestLat,
          destinationLng: roundedDestLng,
          departureTime,
          returnTime,
          commuteToMin,
          commuteFromMin,
          avgCommuteMin,
        },
      });
    }

    return NextResponse.json({
      commuteToMin,
      commuteFromMin,
      avgCommuteMin,
      distanceToMiles: toDestResult.distanceMiles,
      distanceFromMiles: fromDestResult.distanceMiles,
      cached: false,
    });
  } catch (error) {
    console.error("Error in commute API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

