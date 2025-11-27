import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { fetchRentCastListings, transformRentCastListing } from "@/lib/rentcast";
import { calculateCommutesForListings } from "@/lib/commute";
import { calculateValueScore } from "@/lib/value-score";
import type { ListingWithCommute } from "@/types/listing";

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.5).max(50).default(10),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/).default("08:00"),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/).default("17:00"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minBedrooms: z.coerce.number().min(0).optional(),
  maxBedrooms: z.coerce.number().min(0).optional(),
  propertyTypes: z.string().optional(),
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
      lat,
      lng,
      radius,
      departureTime,
      returnTime,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      propertyTypes,
    } = parsed.data;

    // Try to fetch from RentCast API
    let listings: Awaited<ReturnType<typeof prisma.listing.findMany>> = [];
    
    try {
      const rentCastListings = await fetchRentCastListings({
        latitude: lat,
        longitude: lng,
        radius,
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        propertyType: propertyTypes?.split(",")[0], // RentCast only accepts one type
      });

      // Transform and upsert listings to database
      for (const rcListing of rentCastListings) {
        const transformed = transformRentCastListing(rcListing);
        
        await prisma.listing.upsert({
          where: { externalId: transformed.externalId },
          update: {
            ...transformed,
            fetchedAt: new Date(),
          },
          create: transformed,
        });
      }

      // Fetch all listings within radius from database
      listings = await prisma.listing.findMany({
        where: {
          latitude: {
            gte: lat - (radius / 69), // Rough conversion: 1 degree ≈ 69 miles
            lte: lat + (radius / 69),
          },
          longitude: {
            gte: lng - (radius / (69 * Math.cos(lat * Math.PI / 180))),
            lte: lng + (radius / (69 * Math.cos(lat * Math.PI / 180))),
          },
          ...(minPrice !== undefined && { price: { gte: minPrice } }),
          ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
          ...(minBedrooms !== undefined && { bedrooms: { gte: minBedrooms } }),
          ...(maxBedrooms !== undefined && { bedrooms: { lte: maxBedrooms } }),
          ...(propertyTypes && {
            propertyType: { in: propertyTypes.split(",") },
          }),
        },
        orderBy: { fetchedAt: "desc" },
        take: 100,
      });
    } catch (apiError) {
      console.error("Error fetching from RentCast:", apiError);
      
      // Fall back to cached listings from database
      listings = await prisma.listing.findMany({
        where: {
          latitude: {
            gte: lat - (radius / 69),
            lte: lat + (radius / 69),
          },
          longitude: {
            gte: lng - (radius / (69 * Math.cos(lat * Math.PI / 180))),
            lte: lng + (radius / (69 * Math.cos(lat * Math.PI / 180))),
          },
          ...(minPrice !== undefined && { price: { gte: minPrice } }),
          ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
          ...(minBedrooms !== undefined && { bedrooms: { gte: minBedrooms } }),
          ...(maxBedrooms !== undefined && { bedrooms: { lte: maxBedrooms } }),
          ...(propertyTypes && {
            propertyType: { in: propertyTypes.split(",") },
          }),
        },
        orderBy: { fetchedAt: "desc" },
        take: 100,
      });
    }

    // Calculate commute times for all listings
    const commuteResults = await calculateCommutesForListings(
      listings,
      lat,
      lng,
      departureTime,
      returnTime
    );

    // Combine listings with commute data and calculate value scores
    const listingsWithCommute: ListingWithCommute[] = listings.map((listing) => {
      const commute = commuteResults.get(listing.id);
      
      const listingWithCommute: ListingWithCommute = {
        ...listing,
        commuteToMin: commute?.commuteToMin ?? null,
        commuteFromMin: commute?.commuteFromMin ?? null,
        avgCommuteMin: commute?.avgCommuteMin ?? null,
        valueScore: null,
      };

      // Calculate value score if we have commute data
      if (commute) {
        listingWithCommute.valueScore = calculateValueScore(listingWithCommute);
      }

      return listingWithCommute;
    });

    // Log search to history
    await prisma.searchHistory.create({
      data: {
        destinationAddress: `${lat}, ${lng}`,
        destinationLat: lat,
        destinationLng: lng,
        radiusMiles: radius,
      },
    });

    return NextResponse.json({
      listings: listingsWithCommute,
      total: listingsWithCommute.length,
    });
  } catch (error) {
    console.error("Error in listings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

