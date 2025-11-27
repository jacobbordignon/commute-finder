import { z } from "zod";

export const SearchParamsSchema = z.object({
  destinationAddress: z.string().min(1, "Destination address is required"),
  destinationLat: z.number(),
  destinationLng: z.number(),
  radiusMiles: z.number().min(0.5).max(50).default(10),
  maxCommuteMinutes: z.number().min(5).max(120).optional(),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format").default("08:00"),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format").default("17:00"),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minBedrooms: z.number().min(0).max(10).optional(),
  maxBedrooms: z.number().min(0).max(10).optional(),
  propertyTypes: z.array(z.string()).optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export interface SearchState {
  // Destination
  destinationAddress: string;
  destinationLat: number | null;
  destinationLng: number | null;
  
  // Search radius
  searchMode: "distance" | "time";
  radiusMiles: number;
  maxCommuteMinutes: number;
  
  // Commute times
  departureTime: string;
  returnTime: string;
  
  // Filters
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  maxBedrooms: number;
  propertyTypes: string[];
  
  // Sort
  sortBy: SortOption;
  
  // UI State
  selectedListingId: string | null;
  hoveredListingId: string | null;
}

export type SortOption = "price_asc" | "price_desc" | "commute_asc" | "value_asc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "value_asc", label: "Best Value" },
  { value: "commute_asc", label: "Shortest Commute" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

