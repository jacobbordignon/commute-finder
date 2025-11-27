import { z } from "zod";

const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";

// RentCast API response schema
const RentCastListingSchema = z.object({
  id: z.string(),
  formattedAddress: z.string(),
  addressLine1: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  price: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  squareFootage: z.number().nullable().optional(),
  propertyType: z.string(),
  listedDate: z.string().optional(),
  lastSeenDate: z.string().optional(),
  daysOnMarket: z.number().optional(),
  photos: z.array(z.string()).optional(),
  listingUrl: z.string().optional(),
});

const RentCastResponseSchema = z.array(RentCastListingSchema);

export type RentCastListing = z.infer<typeof RentCastListingSchema>;

interface FetchListingsParams {
  latitude: number;
  longitude: number;
  radius: number; // in miles
  limit?: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
}

/**
 * Fetch rental listings from RentCast API
 */
export async function fetchRentCastListings(
  params: FetchListingsParams
): Promise<RentCastListing[]> {
  const apiKey = process.env.RENTCAST_API_KEY;
  
  if (!apiKey) {
    throw new Error("RENTCAST_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
    radius: params.radius.toString(),
    limit: (params.limit || 50).toString(),
    status: "active",
  });

  if (params.propertyType) {
    searchParams.set("propertyType", params.propertyType);
  }
  if (params.minPrice !== undefined) {
    searchParams.set("minPrice", params.minPrice.toString());
  }
  if (params.maxPrice !== undefined) {
    searchParams.set("maxPrice", params.maxPrice.toString());
  }
  if (params.minBedrooms !== undefined) {
    searchParams.set("bedrooms", params.minBedrooms.toString());
  }

  const url = `${RENTCAST_BASE_URL}/listings/rental/long-term?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Api-Key": apiKey,
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("RentCast API error:", response.status, errorText);
    throw new Error(`RentCast API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = RentCastResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("RentCast response validation error:", parsed.error);
    throw new Error("Invalid response from RentCast API");
  }

  return parsed.data;
}

/**
 * Transform RentCast listing to our internal format
 */
export function transformRentCastListing(listing: RentCastListing) {
  return {
    externalId: listing.id,
    address: listing.formattedAddress || listing.addressLine1 || "Unknown Address",
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    latitude: listing.latitude,
    longitude: listing.longitude,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.squareFootage || null,
    propertyType: normalizePropertyType(listing.propertyType),
    imageUrl: listing.photos?.[0] || null,
    listingUrl: listing.listingUrl || `https://www.rentcast.io/listing/${listing.id}`,
  };
}

function normalizePropertyType(type: string): string {
  const normalized = type.toLowerCase().replace(/[_-]/g, " ").trim();
  
  const typeMap: Record<string, string> = {
    "single family": "house",
    "single-family": "house",
    "single_family": "house",
    "house": "house",
    "apartment": "apartment",
    "condo": "condo",
    "condominium": "condo",
    "townhouse": "townhouse",
    "townhome": "townhouse",
    "multi family": "multi-family",
    "multi-family": "multi-family",
    "duplex": "multi-family",
    "triplex": "multi-family",
  };

  return typeMap[normalized] || "other";
}

