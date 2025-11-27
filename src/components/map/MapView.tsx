"use client";

import { useCallback, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, CircleF } from "@react-google-maps/api";
import { useSearchStore } from "@/store/searchStore";
import { useMapState } from "@/hooks/useMapState";
import { ListingMarker } from "./ListingMarker";
import { MapControls } from "./MapControls";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export function MapView() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<string | null>(null);

  const {
    listings,
    destinationLat,
    destinationLng,
    radiusMiles,
    selectedListingId,
    hoveredListingId,
    setSelectedListing,
    setHoveredListing,
  } = useSearchStore();

  const { center, zoom, setZoom } = useMapState();

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds when listings change
  const bounds = useMemo(() => {
    if (listings.length === 0 && !destinationLat) return null;

    const b = new google.maps.LatLngBounds();

    if (destinationLat && destinationLng) {
      b.extend({ lat: destinationLat, lng: destinationLng });
    }

    listings.forEach((listing) => {
      b.extend({ lat: listing.latitude, lng: listing.longitude });
    });

    return b;
  }, [listings, destinationLat, destinationLng]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (listingId: string) => {
      setSelectedListing(selectedListingId === listingId ? null : listingId);
      setShowInfoWindow(selectedListingId === listingId ? null : listingId);
    },
    [selectedListingId, setSelectedListing]
  );

  // Get selected listing for info window
  const selectedListing = useMemo(() => {
    if (!showInfoWindow) return null;
    return listings.find((l) => l.id === showInfoWindow);
  }, [listings, showInfoWindow]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="text-center p-6">
          <p className="text-slate-600 font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-slate-500 mt-1">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={destinationLat && destinationLng ? { lat: destinationLat, lng: destinationLng } : center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onZoomChanged={() => {
          if (map) {
            setZoom(map.getZoom() || 12);
          }
        }}
      >
        {/* Search radius circle */}
        {destinationLat && destinationLng && (
          <CircleF
            center={{ lat: destinationLat, lng: destinationLng }}
            radius={radiusMiles * 1609.34} // Convert miles to meters
            options={{
              fillColor: "#10b981",
              fillOpacity: 0.08,
              strokeColor: "#10b981",
              strokeOpacity: 0.3,
              strokeWeight: 2,
            }}
          />
        )}

        {/* Destination marker */}
        {destinationLat && destinationLng && (
          <MarkerF
            position={{ lat: destinationLat, lng: destinationLng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#059669",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
            zIndex={1000}
            title="Your destination"
          />
        )}

        {/* Listing markers */}
        {listings.map((listing) => (
          <ListingMarker
            key={listing.id}
            listing={listing}
            isSelected={listing.id === selectedListingId}
            isHovered={listing.id === hoveredListingId}
            onClick={() => handleMarkerClick(listing.id)}
            onMouseOver={() => setHoveredListing(listing.id)}
            onMouseOut={() => setHoveredListing(null)}
          />
        ))}

        {/* Info window for selected listing */}
        {selectedListing && showInfoWindow && (
          <InfoWindowF
            position={{
              lat: selectedListing.latitude,
              lng: selectedListing.longitude,
            }}
            onCloseClick={() => {
              setShowInfoWindow(null);
              setSelectedListing(null);
            }}
            options={{
              pixelOffset: new google.maps.Size(0, -30),
            }}
          >
            <div className="p-2 min-w-[200px]">
              <h4 className="font-semibold text-slate-900 mb-1">
                {formatCurrency(selectedListing.price)}/mo
              </h4>
              <p className="text-sm text-slate-600 mb-2">
                {selectedListing.bedrooms} bed • {selectedListing.bathrooms} bath
                {selectedListing.sqft && ` • ${selectedListing.sqft} sqft`}
              </p>
              {selectedListing.avgCommuteMin !== null && (
                <p className="text-sm font-medium text-emerald-600">
                  ~{formatDuration(selectedListing.avgCommuteMin)} avg commute
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1 truncate">
                {selectedListing.address}
              </p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Map controls overlay */}
      <MapControls map={map} bounds={bounds} />
    </div>
  );
}

