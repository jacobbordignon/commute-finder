import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SearchState, SortOption } from "@/types/search";
import type { ListingWithCommute } from "@/types/listing";

interface SearchStore extends SearchState {
  // Listings data
  listings: ListingWithCommute[];
  isLoading: boolean;
  error: string | null;

  // Actions - Destination
  setDestination: (address: string, lat: number, lng: number) => void;
  clearDestination: () => void;

  // Actions - Search mode
  setSearchMode: (mode: "distance" | "time") => void;
  setRadiusMiles: (radius: number) => void;
  setMaxCommuteMinutes: (minutes: number) => void;

  // Actions - Commute times
  setDepartureTime: (time: string) => void;
  setReturnTime: (time: string) => void;

  // Actions - Filters
  setPriceRange: (min: number, max: number) => void;
  setBedroomRange: (min: number, max: number) => void;
  setPropertyTypes: (types: string[]) => void;

  // Actions - Sort
  setSortBy: (sort: SortOption) => void;

  // Actions - Selection
  setSelectedListing: (id: string | null) => void;
  setHoveredListing: (id: string | null) => void;

  // Actions - Data
  setListings: (listings: ListingWithCommute[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Reset
  resetFilters: () => void;
  resetAll: () => void;
}

const defaultState: Omit<SearchState, "selectedListingId" | "hoveredListingId"> & {
  listings: ListingWithCommute[];
  isLoading: boolean;
  error: string | null;
  selectedListingId: string | null;
  hoveredListingId: string | null;
} = {
  // Destination
  destinationAddress: "",
  destinationLat: null,
  destinationLng: null,

  // Search radius
  searchMode: "distance",
  radiusMiles: 10,
  maxCommuteMinutes: 30,

  // Commute times
  departureTime: "08:00",
  returnTime: "17:00",

  // Filters
  minPrice: 0,
  maxPrice: 5000,
  minBedrooms: 0,
  maxBedrooms: 5,
  propertyTypes: [],

  // Sort
  sortBy: "value_asc",

  // UI State
  selectedListingId: null,
  hoveredListingId: null,

  // Data
  listings: [],
  isLoading: false,
  error: null,
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      ...defaultState,

      // Destination actions
      setDestination: (address, lat, lng) =>
        set({
          destinationAddress: address,
          destinationLat: lat,
          destinationLng: lng,
        }),

      clearDestination: () =>
        set({
          destinationAddress: "",
          destinationLat: null,
          destinationLng: null,
        }),

      // Search mode actions
      setSearchMode: (mode) => set({ searchMode: mode }),
      setRadiusMiles: (radius) => set({ radiusMiles: radius }),
      setMaxCommuteMinutes: (minutes) => set({ maxCommuteMinutes: minutes }),

      // Commute time actions
      setDepartureTime: (time) => set({ departureTime: time }),
      setReturnTime: (time) => set({ returnTime: time }),

      // Filter actions
      setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
      setBedroomRange: (min, max) => set({ minBedrooms: min, maxBedrooms: max }),
      setPropertyTypes: (types) => set({ propertyTypes: types }),

      // Sort action
      setSortBy: (sort) => set({ sortBy: sort }),

      // Selection actions
      setSelectedListing: (id) => set({ selectedListingId: id }),
      setHoveredListing: (id) => set({ hoveredListingId: id }),

      // Data actions
      setListings: (listings) => set({ listings }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Reset actions
      resetFilters: () =>
        set({
          minPrice: 0,
          maxPrice: 5000,
          minBedrooms: 0,
          maxBedrooms: 5,
          propertyTypes: [],
          sortBy: "value_asc",
        }),

      resetAll: () => set(defaultState),
    }),
    {
      name: "rental-search-store",
      partialize: (state) => ({
        // Only persist search preferences, not data
        searchMode: state.searchMode,
        radiusMiles: state.radiusMiles,
        maxCommuteMinutes: state.maxCommuteMinutes,
        departureTime: state.departureTime,
        returnTime: state.returnTime,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        minBedrooms: state.minBedrooms,
        maxBedrooms: state.maxBedrooms,
        propertyTypes: state.propertyTypes,
        sortBy: state.sortBy,
      }),
    }
  )
);

