"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore } from "@/store/searchStore";
import { PROPERTY_TYPES } from "@/types/listing";
import { SORT_OPTIONS } from "@/types/search";
import { formatCurrency } from "@/lib/utils";

export function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    searchMode,
    radiusMiles,
    maxCommuteMinutes,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes,
    sortBy,
    setSearchMode,
    setRadiusMiles,
    setMaxCommuteMinutes,
    setPriceRange,
    setBedroomRange,
    setPropertyTypes,
    setSortBy,
    resetFilters,
  } = useSearchStore();

  const handlePropertyTypeToggle = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter((t) => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const activeFilterCount =
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 5000 ? 1 : 0) +
    (minBedrooms > 0 ? 1 : 0) +
    (maxBedrooms < 5 ? 1 : 0) +
    (propertyTypes.length > 0 ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
          <span className="font-medium text-neutral-700 text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-neutral-900 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-neutral-100">
          {/* Search Mode Toggle */}
          <div className="pt-4">
            <Label className="mb-2 block text-xs text-neutral-500 uppercase tracking-wide">Search By</Label>
            <div className="flex gap-2">
              <Button
                variant={searchMode === "distance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchMode("distance")}
                className={searchMode === "distance" ? "bg-neutral-900 hover:bg-neutral-800" : ""}
              >
                Distance
              </Button>
              <Button
                variant={searchMode === "time" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchMode("time")}
                className={searchMode === "time" ? "bg-neutral-900 hover:bg-neutral-800" : ""}
              >
                Commute Time
              </Button>
            </div>
          </div>

          {/* Distance/Time Slider */}
          <div>
            {searchMode === "distance" ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-neutral-500 uppercase tracking-wide">Search Radius</Label>
                  <span className="text-sm font-medium text-neutral-700">
                    {radiusMiles} mi
                  </span>
                </div>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[radiusMiles]}
                  onValueChange={([value]) => setRadiusMiles(value)}
                  className="[&_[role=slider]]:bg-neutral-900"
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-neutral-500 uppercase tracking-wide">Max Commute</Label>
                  <span className="text-sm font-medium text-neutral-700">
                    {maxCommuteMinutes} min
                  </span>
                </div>
                <Slider
                  min={5}
                  max={120}
                  step={5}
                  value={[maxCommuteMinutes]}
                  onValueChange={([value]) => setMaxCommuteMinutes(value)}
                  className="[&_[role=slider]]:bg-neutral-900"
                />
              </>
            )}
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">Price Range</Label>
              <span className="text-sm font-medium text-neutral-700">
                {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </span>
            </div>
            <div className="space-y-3">
              <Slider
                min={0}
                max={5000}
                step={100}
                value={[minPrice, maxPrice]}
                onValueChange={([min, max]) => setPriceRange(min, max)}
                className="[&_[role=slider]]:bg-neutral-900"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <Label className="mb-2 block text-xs text-neutral-500 uppercase tracking-wide">Bedrooms</Label>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  variant={
                    num >= minBedrooms && num <= maxBedrooms
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    if (num < minBedrooms) {
                      setBedroomRange(num, maxBedrooms);
                    } else if (num > maxBedrooms) {
                      setBedroomRange(minBedrooms, num);
                    } else {
                      setBedroomRange(num, num);
                    }
                  }}
                  className={`flex-1 px-0 h-8 text-xs ${
                    num >= minBedrooms && num <= maxBedrooms 
                      ? "bg-neutral-900 hover:bg-neutral-800" 
                      : ""
                  }`}
                >
                  {num === 0 ? "0" : num === 5 ? "5+" : num}
                </Button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <Label className="mb-2 block text-xs text-neutral-500 uppercase tracking-wide">Property Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={propertyTypes.includes(type.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePropertyTypeToggle(type.value)}
                  className={`h-8 text-xs ${
                    propertyTypes.includes(type.value) 
                      ? "bg-neutral-900 hover:bg-neutral-800" 
                      : ""
                  }`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <Label className="mb-2 block text-xs text-neutral-500 uppercase tracking-wide">Sort By</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="w-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
