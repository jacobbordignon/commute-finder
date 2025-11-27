import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { geocodeAddress, reverseGeocode } from "@/lib/google-maps";

const GeocoderQuerySchema = z.object({
  address: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = GeocoderQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { address, lat, lng } = parsed.data;

    // Forward geocoding: address -> coordinates
    if (address) {
      const result = await geocodeAddress(address);

      if (!result) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
      });
    }

    // Reverse geocoding: coordinates -> address
    if (lat !== undefined && lng !== undefined) {
      const formattedAddress = await reverseGeocode(lat, lng);

      if (!formattedAddress) {
        return NextResponse.json(
          { error: "Location not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        address: formattedAddress,
        lat,
        lng,
      });
    }

    return NextResponse.json(
      { error: "Either 'address' or 'lat' and 'lng' must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in geocode API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

