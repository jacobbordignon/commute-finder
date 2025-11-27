"use client";

import { MarkerF } from "@react-google-maps/api";
import type { ListingWithCommute } from "@/types/listing";
import { formatCurrency } from "@/lib/utils";

interface ListingMarkerProps {
  listing: ListingWithCommute;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

export function ListingMarker({
  listing,
  isSelected,
  isHovered,
  onClick,
  onMouseOver,
  onMouseOut,
}: ListingMarkerProps) {
  // Determine marker color based on value score
  const getMarkerColor = () => {
    if (isSelected) return "#059669"; // emerald-600
    if (isHovered) return "#10b981"; // emerald-500
    
    if (listing.valueScore === null) return "#94a3b8"; // slate-400
    
    if (listing.valueScore < 50) return "#10b981"; // emerald-500 - excellent
    if (listing.valueScore < 75) return "#3b82f6"; // blue-500 - good
    if (listing.valueScore < 100) return "#f59e0b"; // amber-500 - fair
    return "#ef4444"; // red-500 - poor
  };

  const markerColor = getMarkerColor();
  const scale = isSelected || isHovered ? 1.2 : 1;

  // Create a custom SVG marker
  const markerIcon = {
    path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
    fillColor: markerColor,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: scale,
    anchor: new google.maps.Point(12, 21),
  };

  return (
    <MarkerF
      position={{ lat: listing.latitude, lng: listing.longitude }}
      icon={markerIcon}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      zIndex={isSelected ? 100 : isHovered ? 50 : 1}
      title={`${formatCurrency(listing.price)}/mo - ${listing.address}`}
    />
  );
}

