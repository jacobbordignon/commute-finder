import { z } from "zod";

const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api";

// Distance Matrix API response schema
const DistanceMatrixElementSchema = z.object({
  distance: z.object({
    value: z.number(), // meters
    text: z.string(),
  }).optional(),
  duration: z.object({
    value: z.number(), // seconds
    text: z.string(),
  }).optional(),
  duration_in_traffic: z.object({
    value: z.number(),
    text: z.string(),
  }).optional(),
  status: z.string(),
});

const DistanceMatrixRowSchema = z.object({
  elements: z.array(DistanceMatrixElementSchema),
});

const DistanceMatrixResponseSchema = z.object({
  status: z.string(),
  origin_addresses: z.array(z.string()),
  destination_addresses: z.array(z.string()),
  rows: z.array(DistanceMatrixRowSchema),
});

// Geocoding API response schema
const GeocodeResultSchema = z.object({
  formatted_address: z.string(),
  geometry: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  place_id: z.string(),
});

const GeocodeResponseSchema = z.object({
  status: z.string(),
  results: z.array(GeocodeResultSchema),
});

export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;

interface CommuteResult {
  durationMinutes: number;
  distanceMiles: number;
  durationInTrafficMinutes?: number;
}

/**
 * Get commute time between origin and destination
 * Uses Distance Matrix API with traffic data
 */
export async function getCommuteTime(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  departureTime?: Date
): Promise<CommuteResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_KEY is not configured");
  }

  const params = new URLSearchParams({
    origins: `${originLat},${originLng}`,
    destinations: `${destLat},${destLng}`,
    mode: "driving",
    key: apiKey,
  });

  // Add departure time for traffic estimates
  if (departureTime) {
    params.set("departure_time", Math.floor(departureTime.getTime() / 1000).toString());
    params.set("traffic_model", "best_guess");
  }

  const url = `${GOOGLE_MAPS_BASE_URL}/distancematrix/json?${params.toString()}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    console.error("Distance Matrix API error:", response.status);
    return null;
  }

  const data = await response.json();
  const parsed = DistanceMatrixResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Distance Matrix response validation error:", parsed.error);
    return null;
  }

  if (parsed.data.status !== "OK") {
    console.error("Distance Matrix API status:", parsed.data.status);
    return null;
  }

  const element = parsed.data.rows[0]?.elements[0];
  
  if (!element || element.status !== "OK" || !element.duration || !element.distance) {
    return null;
  }

  return {
    durationMinutes: Math.round(element.duration.value / 60),
    distanceMiles: Math.round((element.distance.value / 1609.34) * 10) / 10, // meters to miles
    durationInTrafficMinutes: element.duration_in_traffic 
      ? Math.round(element.duration_in_traffic.value / 60)
      : undefined,
  };
}

/**
 * Batch get commute times for multiple origins to a single destination
 * Google Distance Matrix allows up to 25 origins per request
 */
export async function getBatchCommuteTimes(
  origins: Array<{ lat: number; lng: number; id: string }>,
  destLat: number,
  destLng: number,
  departureTime?: Date
): Promise<Map<string, CommuteResult | null>> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_KEY is not configured");
  }

  const results = new Map<string, CommuteResult | null>();
  
  // Process in batches of 25 (API limit)
  const batchSize = 25;
  
  for (let i = 0; i < origins.length; i += batchSize) {
    const batch = origins.slice(i, i + batchSize);
    const originsParam = batch.map(o => `${o.lat},${o.lng}`).join("|");

    const params = new URLSearchParams({
      origins: originsParam,
      destinations: `${destLat},${destLng}`,
      mode: "driving",
      key: apiKey,
    });

    if (departureTime) {
      params.set("departure_time", Math.floor(departureTime.getTime() / 1000).toString());
      params.set("traffic_model", "best_guess");
    }

    const url = `${GOOGLE_MAPS_BASE_URL}/distancematrix/json?${params.toString()}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error("Distance Matrix API error:", response.status);
        batch.forEach(o => results.set(o.id, null));
        continue;
      }

      const data = await response.json();
      const parsed = DistanceMatrixResponseSchema.safeParse(data);

      if (!parsed.success || parsed.data.status !== "OK") {
        batch.forEach(o => results.set(o.id, null));
        continue;
      }

      parsed.data.rows.forEach((row, index) => {
        const origin = batch[index];
        const element = row.elements[0];

        if (element?.status === "OK" && element.duration && element.distance) {
          results.set(origin.id, {
            durationMinutes: Math.round(element.duration.value / 60),
            distanceMiles: Math.round((element.distance.value / 1609.34) * 10) / 10,
            durationInTrafficMinutes: element.duration_in_traffic
              ? Math.round(element.duration_in_traffic.value / 60)
              : undefined,
          });
        } else {
          results.set(origin.id, null);
        }
      });
    } catch (error) {
      console.error("Batch commute calculation error:", error);
      batch.forEach(o => results.set(o.id, null));
    }
  }

  return results;
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_KEY is not configured");
  }

  const params = new URLSearchParams({
    address,
    key: apiKey,
  });

  const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?${params.toString()}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    console.error("Geocoding API error:", response.status);
    return null;
  }

  const data = await response.json();
  const parsed = GeocodeResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Geocoding response validation error:", parsed.error);
    return null;
  }

  if (parsed.data.status !== "OK" || parsed.data.results.length === 0) {
    return null;
  }

  return parsed.data.results[0];
}

/**
 * Reverse geocode coordinates to an address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_KEY is not configured");
  }

  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: apiKey,
  });

  const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?${params.toString()}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const parsed = GeocodeResponseSchema.safeParse(data);

  if (!parsed.success || parsed.data.status !== "OK" || parsed.data.results.length === 0) {
    return null;
  }

  return parsed.data.results[0].formatted_address;
}

/**
 * Create a departure time for a given time string on the next occurrence of that time
 * E.g., "08:00" -> next 8 AM
 */
export function getNextDepartureTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const departure = new Date();
  
  departure.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, use tomorrow
  if (departure <= now) {
    departure.setDate(departure.getDate() + 1);
  }
  
  // Skip weekends for more accurate traffic estimates
  while (departure.getDay() === 0 || departure.getDay() === 6) {
    departure.setDate(departure.getDate() + 1);
  }
  
  return departure;
}

