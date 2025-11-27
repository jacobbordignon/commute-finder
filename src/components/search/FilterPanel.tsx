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
    <div className="bg-white rounded-xl border-2 border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-slate-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-slate-100">
          {/* Search Mode Toggle */}
          <div className="pt-4">
            <Label className="mb-2 block">Search By</Label>
            <div className="flex gap-2">
              <Button
                variant={searchMode === "distance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchMode("distance")}
                className="flex-1"
              >
                Distance
              </Button>
              <Button
                variant={searchMode === "time" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchMode("time")}
                className="flex-1"
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
                  <Label>Search Radius</Label>
                  <span className="text-sm font-medium text-emerald-600">
                    {radiusMiles} miles
                  </span>
                </div>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[radiusMiles]}
                  onValueChange={([value]) => setRadiusMiles(value)}
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Label>Max Commute Time</Label>
                  <span className="text-sm font-medium text-emerald-600">
                    {maxCommuteMinutes} min
                  </span>
                </div>
                <Slider
                  min={5}
                  max={120}
                  step={5}
                  value={[maxCommuteMinutes]}
                  onValueChange={([value]) => setMaxCommuteMinutes(value)}
                />
              </>
            )}
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Price Range</Label>
              <span className="text-sm font-medium text-emerald-600">
                {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500">Min</span>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={[minPrice]}
                  onValueChange={([value]) => setPriceRange(value, maxPrice)}
                />
              </div>
              <div>
                <span className="text-xs text-slate-500">Max</span>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={[maxPrice]}
                  onValueChange={([value]) => setPriceRange(minPrice, value)}
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Bedrooms</Label>
              <span className="text-sm font-medium text-emerald-600">
                {minBedrooms === maxBedrooms
                  ? `${minBedrooms} bed${minBedrooms !== 1 ? "s" : ""}`
                  : `${minBedrooms} - ${maxBedrooms} beds`}
              </span>
            </div>
            <div className="flex gap-2">
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
                      // Toggle single selection
                      setBedroomRange(num, num);
                    }
                  }}
                  className="flex-1 px-0"
                >
                  {num === 0 ? "Studio" : num === 5 ? "5+" : num}
                </Button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <Label className="mb-2 block">Property Type</Label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={propertyTypes.includes(type.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePropertyTypeToggle(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <Label className="mb-2 block">Sort By</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
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
            className="w-full text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}

