"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/store/searchStore";
import { cn } from "@/lib/utils";

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export function LocationInput() {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    destinationAddress,
    setDestination,
    clearDestination,
  } = useSearchStore();

  // Initialize input with stored address
  useEffect(() => {
    if (destinationAddress) {
      setInputValue(destinationAddress);
    }
  }, [destinationAddress]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch predictions from Google Places Autocomplete
  const fetchPredictions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Use Google Maps Places Autocomplete Service
      const google = (window as unknown as { google: typeof globalThis.google }).google;
      if (!google?.maps?.places) {
        console.warn("Google Maps Places API not loaded");
        return;
      }

      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input,
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "us" },
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(
              results.map((r) => ({
                placeId: r.place_id,
                description: r.description,
                mainText: r.structured_formatting.main_text,
                secondaryText: r.structured_formatting.secondary_text || "",
              }))
            );
          } else {
            setPredictions([]);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setIsLoading(false);
    }
  }, []);

  // Debounced prediction fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== destinationAddress) {
        fetchPredictions(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, destinationAddress, fetchPredictions]);

  // Handle prediction selection
  const handleSelectPrediction = useCallback(async (prediction: Prediction) => {
    setInputValue(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    // Geocode the selected place
    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(prediction.description)}`
      );

      if (response.ok) {
        const data = await response.json();
        setDestination(data.address, data.lat, data.lng);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  }, [setDestination]);

  // Handle manual search
  const handleSearch = useCallback(async () => {
    if (!inputValue) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(inputValue)}`
      );

      if (response.ok) {
        const data = await response.json();
        setInputValue(data.address);
        setDestination(data.address, data.lat, data.lng);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, setDestination]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInputValue("");
    setPredictions([]);
    clearDestination();
    inputRef.current?.focus();
  }, [clearDestination]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowPredictions(true);
            }}
            onFocus={() => setShowPredictions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Enter your school or destination address..."
            className="pl-10 pr-10 h-12 text-base"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue || isLoading}
          size="lg"
          className="h-12 px-6"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border-2 border-slate-200 shadow-xl overflow-hidden">
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              onClick={() => handleSelectPrediction(prediction)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors",
                "flex items-start gap-3 border-b border-slate-100 last:border-0"
              )}
            >
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{prediction.mainText}</p>
                <p className="text-sm text-slate-500">{prediction.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && showPredictions && predictions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border-2 border-slate-200 shadow-xl p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
}

