"use client";

import { Bed, Bath, Square, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ValueBadge } from "./ValueBadge";
import { useSearchStore } from "@/store/searchStore";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";
import type { ListingWithCommute } from "@/types/listing";

interface ListingCardProps {
  listing: ListingWithCommute;
}

export function ListingCard({ listing }: ListingCardProps) {
  const {
    selectedListingId,
    hoveredListingId,
    setSelectedListing,
    setHoveredListing,
  } = useSearchStore();

  const isSelected = listing.id === selectedListingId;
  const isHovered = listing.id === hoveredListingId;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-150 border-neutral-200 hover:border-neutral-300",
        isSelected && "ring-2 ring-neutral-900 border-neutral-900",
        isHovered && !isSelected && "border-neutral-400"
      )}
      onClick={() => setSelectedListing(isSelected ? null : listing.id)}
      onMouseEnter={() => setHoveredListing(listing.id)}
      onMouseLeave={() => setHoveredListing(null)}
    >
      <CardContent className="p-4">
        {/* Header: Price + Commute + Value */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-semibold text-neutral-900 text-lg">
                {formatCurrency(listing.price)}
              </span>
              <span className="text-neutral-400 text-sm">/mo</span>
            </div>
            {listing.avgCommuteMin !== null && (
              <div className="flex items-center gap-1.5 text-neutral-600">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-sm">
                  {formatDuration(listing.avgCommuteMin)} commute
                </span>
              </div>
            )}
          </div>
          {listing.valueScore !== null && (
            <ValueBadge score={listing.valueScore} />
          )}
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 text-neutral-600 mb-3">
          <div className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            <span className="text-sm">{listing.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            <span className="text-sm">{listing.bathrooms} bath</span>
          </div>
          {listing.sqft && (
            <div className="flex items-center gap-1">
              <Square className="h-3.5 w-3.5" />
              <span className="text-sm">{listing.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-neutral-500 mb-3 line-clamp-1">
          {listing.address}
        </p>

        {/* Property type badge + View link */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="capitalize bg-neutral-100 text-neutral-600 hover:bg-neutral-100 font-normal">
            {listing.propertyType}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 -mr-2 h-8"
            onClick={(e) => {
              e.stopPropagation();
              window.open(listing.listingUrl, "_blank");
            }}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">View</span>
          </Button>
        </div>

        {/* Commute details (shown when selected) */}
        {isSelected && listing.commuteToMin !== null && listing.commuteFromMin !== null && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
              Commute Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-neutral-50 rounded-md p-2">
                <p className="text-xs text-neutral-500">To destination</p>
                <p className="font-medium text-neutral-800">
                  {formatDuration(listing.commuteToMin)}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-md p-2">
                <p className="text-xs text-neutral-500">Return trip</p>
                <p className="font-medium text-neutral-800">
                  {formatDuration(listing.commuteFromMin)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
