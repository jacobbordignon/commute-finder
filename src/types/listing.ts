export interface Listing {
  id: string;
  externalId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  propertyType: string;
  imageUrl: string | null;
  listingUrl: string;
  fetchedAt: Date;
}

export interface ListingWithCommute extends Listing {
  commuteToMin: number | null;
  commuteFromMin: number | null;
  avgCommuteMin: number | null;
  valueScore: number | null;
}

export type PropertyType = 
  | "apartment"
  | "house"
  | "condo"
  | "townhouse"
  | "multi-family"
  | "other";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "other", label: "Other" },
];

