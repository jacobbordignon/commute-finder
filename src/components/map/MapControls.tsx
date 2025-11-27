"use client";

import { Plus, Minus, Maximize2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapControlsProps {
  map: google.maps.Map | null;
  bounds: google.maps.LatLngBounds | null;
}

export function MapControls({ map, bounds }: MapControlsProps) {
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
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="rounded-none border-b border-slate-200 h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="rounded-none h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Fit bounds button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFitBounds}
        className="bg-white shadow-lg border border-slate-200 h-10 w-10"
        title="Fit all markers"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>

      {/* Current location button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCurrentLocation}
        className="bg-white shadow-lg border border-slate-200 h-10 w-10"
        title="Go to my location"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}

