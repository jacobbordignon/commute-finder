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
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-emerald-500 shadow-md",
        isHovered && !isSelected && "border-emerald-300 shadow-sm"
      )}
      onClick={() => setSelectedListing(isSelected ? null : listing.id)}
      onMouseEnter={() => setHoveredListing(listing.id)}
      onMouseLeave={() => setHoveredListing(null)}
    >
      <CardContent className="p-4">
        {/* Header: Price + Commute + Value */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-900 text-xl">
                {formatCurrency(listing.price)}
              </span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            {listing.avgCommuteMin !== null && (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {formatDuration(listing.avgCommuteMin)} avg commute
                </span>
              </div>
            )}
          </div>
          {listing.valueScore !== null && (
            <ValueBadge score={listing.valueScore} />
          )}
        </div>

        {/* Content */}
        <div>
          {/* Property details */}
          <div className="flex items-center gap-3 text-slate-600 mb-3">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span className="text-sm font-medium">{listing.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span className="text-sm font-medium">{listing.bathrooms} bath</span>
            </div>
            {listing.sqft && (
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span className="text-sm font-medium">{listing.sqft.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          {/* Address */}
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
            {listing.address}
          </p>

          {/* Property type badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="capitalize">
              {listing.propertyType}
            </Badge>

            {/* View listing button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 -mr-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(listing.listingUrl, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>

          {/* Commute details (shown when selected) */}
          {isSelected && listing.commuteToMin !== null && listing.commuteFromMin !== null && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Commute Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-500">To school</p>
                  <p className="font-semibold text-slate-900">
                    {formatDuration(listing.commuteToMin)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-500">From school</p>
                  <p className="font-semibold text-slate-900">
                    {formatDuration(listing.commuteFromMin)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

