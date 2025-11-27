import type { ListingWithCommute } from "@/types/listing";

/**
 * Calculate value score for a listing
 * 
 * The value score considers:
 * 1. Price per square foot (or estimated if sqft not available)
 * 2. Average commute time (weighted heavily as this is core to the app)
 * 3. Number of bedrooms (more bedrooms = better value per dollar)
 * 
 * Lower score = better value
 */
export function calculateValueScore(listing: ListingWithCommute): number {
  // Base: price per month
  let score = listing.price;

  // Normalize by square footage (estimate if not available)
  const estimatedSqft = listing.sqft || estimateSqft(listing.bedrooms, listing.propertyType);
  const pricePerSqft = listing.price / estimatedSqft;
  
  // Price component (normalized to ~0-100 range for typical rentals)
  const priceScore = pricePerSqft * 50;

  // Commute component - heavily weighted
  // Each minute of commute adds to the score
  // 30 min commute = +60 points, 60 min = +120 points
  const commuteScore = listing.avgCommuteMin !== null 
    ? listing.avgCommuteMin * 2 
    : 50; // Default penalty for unknown commute

  // Bedroom efficiency - more bedrooms for the price is better
  // Subtract points for more bedrooms
  const bedroomBonus = listing.bedrooms * 10;

  // Final score calculation
  score = priceScore + commuteScore - bedroomBonus;

  // Ensure non-negative
  return Math.max(0, Math.round(score * 100) / 100);
}

/**
 * Estimate square footage based on bedrooms and property type
 */
function estimateSqft(bedrooms: number, propertyType: string): number {
  const baseByType: Record<string, number> = {
    apartment: 650,
    condo: 750,
    townhouse: 1000,
    house: 1200,
    "multi-family": 800,
    other: 700,
  };

  const base = baseByType[propertyType] || 700;
  const perBedroom = propertyType === "house" ? 350 : 250;

  return base + (bedrooms - 1) * perBedroom;
}

/**
 * Sort listings by the specified criteria
 */
export function sortListings(
  listings: ListingWithCommute[],
  sortBy: "price_asc" | "price_desc" | "commute_asc" | "value_asc"
): ListingWithCommute[] {
  const sorted = [...listings];

  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    
    case "commute_asc":
      return sorted.sort((a, b) => {
        // Put null commutes at the end
        if (a.avgCommuteMin === null) return 1;
        if (b.avgCommuteMin === null) return -1;
        return a.avgCommuteMin - b.avgCommuteMin;
      });
    
    case "value_asc":
      return sorted.sort((a, b) => {
        const aScore = a.valueScore ?? calculateValueScore(a);
        const bScore = b.valueScore ?? calculateValueScore(b);
        return aScore - bScore;
      });
    
    default:
      return sorted;
  }
}

/**
 * Get value rating category based on score
 */
export function getValueRating(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score < 50) return "excellent";
  if (score < 75) return "good";
  if (score < 100) return "fair";
  return "poor";
}

/**
 * Calculate percentile rank for a listing among all listings
 */
export function calculatePercentileRank(
  listing: ListingWithCommute,
  allListings: ListingWithCommute[]
): number {
  const listingScore = listing.valueScore ?? calculateValueScore(listing);
  const scores = allListings.map(l => l.valueScore ?? calculateValueScore(l));
  
  const betterCount = scores.filter(s => s < listingScore).length;
  const percentile = ((allListings.length - betterCount) / allListings.length) * 100;
  
  return Math.round(percentile);
}

