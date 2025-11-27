"use client";

import { Plus, Minus, Maximize2, Navigation, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapControlsProps {
  map: google.maps.Map | null;
  bounds: google.maps.LatLngBounds | null;
  mapType: "roadmap" | "satellite";
  onToggleMapType: () => void;
}

export function MapControls({ map, bounds, mapType, onToggleMapType }: MapControlsProps) {
  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) - 1);
    }
  };

  const handleFitBounds = () => {
    if (map && bounds) {
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
    }
  };

  const handleCurrentLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          map.setZoom(14);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <>
      {/* Map type toggle - top left */}
      <div className="absolute top-3 left-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMapType}
          className="bg-white shadow-md border border-neutral-200 hover:bg-neutral-50 text-neutral-700 h-9 px-3 gap-2"
        >
          <Layers className="h-4 w-4" />
          <span className="text-xs font-medium">
            {mapType === "roadmap" ? "Satellite" : "Map"}
          </span>
        </Button>
      </div>

      {/* Other controls - bottom right */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        {/* Zoom controls */}
        <div className="bg-white rounded-md shadow-md border border-neutral-200 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-none border-b border-neutral-200 h-9 w-9 hover:bg-neutral-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-none h-9 w-9 hover:bg-neutral-50"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Fit bounds button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFitBounds}
          className="bg-white shadow-md border border-neutral-200 h-9 w-9 hover:bg-neutral-50"
          title="Fit all markers"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Current location button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCurrentLocation}
          className="bg-white shadow-md border border-neutral-200 h-9 w-9 hover:bg-neutral-50"
          title="Go to my location"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
