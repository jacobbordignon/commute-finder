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
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const {
    destinationAddress,
    setDestination,
    clearDestination,
  } = useSearchStore();

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogle = () => {
      const w = window as unknown as { google?: typeof google };
      if (w.google?.maps?.places) {
        setGoogleLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    // Poll for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

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
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch predictions from Google Places Autocomplete
  const fetchPredictions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    if (!googleLoaded) {
      // Fallback: use our geocode API directly
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const w = window as unknown as { google: typeof google };
      const service = new w.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input,
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "us" },
        },
        (results, status) => {
          setIsLoading(false);
          if (status === w.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(
              results.slice(0, 5).map((r) => ({
                placeId: r.place_id,
                description: r.description,
                mainText: r.structured_formatting.main_text,
                secondaryText: r.structured_formatting.secondary_text || "",
              }))
            );
          } else {
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setIsLoading(false);
    }
  }, [googleLoaded]);

  // Handle input change with debounce
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setShowDropdown(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 3) {
      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        fetchPredictions(value);
      }, 300);
    } else {
      setPredictions([]);
      setIsLoading(false);
    }
  }, [fetchPredictions]);

  // Handle prediction selection
  const handleSelectPrediction = useCallback(async (prediction: Prediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    setPredictions([]);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  }, [setDestination]);

  // Handle manual search (Enter key or button click)
  const handleSearch = useCallback(async () => {
    if (!inputValue) return;

    setShowDropdown(false);
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
    setShowDropdown(false);
    clearDestination();
    inputRef.current?.focus();
  }, [clearDestination]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (inputValue.length >= 3) {
                setShowDropdown(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Enter address, school, or workplace..."
            className="pl-9 pr-9 h-11 text-base bg-neutral-50 border-neutral-200 focus:bg-white focus:border-neutral-400"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue || isLoading}
          size="lg"
          className="h-11 px-5 bg-neutral-900 hover:bg-neutral-800"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
          {/* Loading state */}
          {isLoading && predictions.length === 0 && (
            <div className="px-4 py-3 flex items-center gap-2 text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Predictions */}
          {!isLoading && predictions.length > 0 && (
            <>
              {predictions.map((prediction) => (
                <button
                  key={prediction.placeId}
                  onClick={() => handleSelectPrediction(prediction)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors",
                    "flex items-start gap-3 border-b border-neutral-100 last:border-0"
                  )}
                >
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800 text-sm">{prediction.mainText}</p>
                    <p className="text-xs text-neutral-500">{prediction.secondaryText}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {!isLoading && predictions.length === 0 && inputValue.length >= 3 && googleLoaded && (
            <div className="px-4 py-3 text-sm text-neutral-500">
              No results found. Press Enter to search anyway.
            </div>
          )}

          {/* Google not loaded fallback */}
          {!googleLoaded && inputValue.length >= 3 && (
            <div className="px-4 py-3 text-sm text-neutral-500">
              Press Enter to search for this address.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
