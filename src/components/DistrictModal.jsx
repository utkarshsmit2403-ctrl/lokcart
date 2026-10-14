"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  MapPinned
} from "lucide-react";

export default function DistrictModal() {
  const {
    userLocation,
    clearLocation,
    isDistrictModalOpen,
    setIsDistrictModalOpen,
    fetchLocationByPincode,
    detectUserLocation,
    searchAddressNominatim,
    selectLocationFromNominatim,
    locationLoading,
    locationError,
    setLocationError,
  } = useStore();

  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAddressNominatim(searchInput.trim());
        setSuggestions(results || []);
      } catch (err) {
        console.error("Address search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchInput]);

  const handleSelectSuggestion = (item) => {
    selectLocationFromNominatim(item);
    setSearchInput("");
    setSuggestions([]);
    setSuccessMsg(`Delivery location set to ${item.display_name?.split(",").slice(0, 2).join(", ")}`);
    setTimeout(() => {
      setSuccessMsg(null);
      setIsDistrictModalOpen(false);
    }, 1000);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const cleanPin = searchInput.trim().replace(/\D/g, "");
    if (cleanPin.length === 6) {
      const res = await fetchLocationByPincode(cleanPin);
      if (res.success) {
        setSuccessMsg(`Delivery location set to ${res.data.city}, ${res.data.state} (${cleanPin})`);
        setTimeout(() => {
          setSuccessMsg(null);
          setIsDistrictModalOpen(false);
        }, 1000);
      }
      return;
    }

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else {
      setIsSearching(true);
      const results = await searchAddressNominatim(searchInput.trim());
      setIsSearching(false);
      if (results && results.length > 0) {
        handleSelectSuggestion(results[0]);
      } else {
        setLocationError("Couldn't find that address. Try a nearby city or PIN code.");
      }
    }
  };

  return (
    <Dialog open={isDistrictModalOpen} onOpenChange={setIsDistrictModalOpen}>
      <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden bg-card border border-brand-line rounded-[20px] shadow-2xl font-sans gap-0">
        
        {/* Header Section */}
        <DialogHeader className="px-[24px] pt-[24px] pb-[16px] border-b border-brand-line space-y-1.5 bg-muted/30">
          <DialogTitle className="text-xl font-bold text-brand-primary tracking-tight text-left">
            Where should we deliver?
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-brand-subtle text-left">
            Find local ODOP craftsmen, fresh groceries, and artisans nearest to you.
          </DialogDescription>
        </DialogHeader>

        <div className="p-[24px] space-y-[20px]">
          {/* Current location, or a prompt to set one */}
          {userLocation && (
            <div className="bg-muted p-[16px] rounded-card border border-brand-line flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[40px] h-[40px] rounded-full bg-card text-brand-tertiary flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-line">
                  <MapPinned className="" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                    Current Delivery Location
                  </div>
                  <div className="text-sm font-bold text-brand-primary truncate leading-tight mt-0.5">
                    {userLocation.city}{userLocation.pincode ? `, ${userLocation.pincode}` : ""}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={clearLocation}
                className="h-8 px-3 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-button transition-colors"
              >
                Clear
              </Button>
            </div>
          )}

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4  text-brand-subtle" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setLocationError(null);
                  setSuccessMsg(null);
                }}
                placeholder="Search area, city, or PIN code..."
                className="h-[52px] w-full pl-12 pr-24 bg-card border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary shadow-sm"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="p-1.5 text-brand-subtle hover:text-brand-primary transition-colors bg-muted rounded-full"
                  >
                    <X className="text-xl h-5 w-5" />
                  </button>
                )}
                <Button
                  type="submit"
                  disabled={!searchInput.trim() || isSearching}
                  className="h-[36px] px-4 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-transform active:scale-[0.98] shadow-sm"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Loading skeleton */}
            {isSearching && (
              <div className="absolute top-[110%] left-0 w-full z-10 p-[12px] bg-card rounded-card border border-brand-line shadow-lg space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2.5">
                      <Skeleton className="h-3 w-3/4 bg-muted" />
                      <Skeleton className="h-2 w-1/2 bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && !isSearching && (
              <div className="absolute top-[110%] left-0 w-full z-10 max-h-64 overflow-y-auto bg-card rounded-card border border-brand-line shadow-lg py-2 custom-scrollbar">
                {suggestions.map((item, idx) => {
                  const addr = item.address || {};
                  const primaryText =
                    addr.suburb ||
                    addr.neighbourhood ||
                    addr.city ||
                    addr.town ||
                    addr.county ||
                    item.name;
                  const secondaryText = item.display_name;

                  return (
                    <button
                      key={item.place_id || idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-brand-line last:border-0"
                    >
                      <MapPin className=" text-brand-tertiary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-brand-primary truncate">
                          {primaryText}
                          {addr.postcode ? ` - ${addr.postcode}` : ""}
                        </div>
                        <div className="text-xs font-medium text-brand-subtle truncate mt-1">
                          {secondaryText}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative py-[8px]">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brand-line" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-card px-3 text-brand-subtle">OR</span>
            </div>
          </div>

          {/* GPS auto-detection */}
          <button
            type="button"
            onClick={detectUserLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-between p-[16px] border border-brand-line hover:border-brand-tertiary bg-muted/50 hover:bg-muted rounded-card transition-all group disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            <div className="flex items-center gap-3 text-brand-tertiary">
              {locationLoading ? (
                <Loader2 className=" animate-spin" />
              ) : (
                <Navigation className=" group-hover:scale-105 transition-transform" />
              )}
              <div className="text-left">
                <div className="text-sm font-bold text-brand-primary">Use my current location</div>
                <div className="text-xs font-medium text-brand-subtle mt-1">Detect automatically using GPS</div>
              </div>
            </div>
          </button>

          {/* Feedback Alerts */}
          {locationError && (
            <Alert className="bg-destructive/10 border border-destructive/20 text-destructive rounded-card py-[16px]">
              <AlertCircle className="h-5 w-5 stroke-destructive" />
              <AlertDescription className="text-xs font-bold ml-2">
                {locationError}
              </AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="bg-brand-tertiary/10 border border-brand-tertiary/20 text-brand-tertiary rounded-card py-[16px]">
              <CheckCircle2 className="h-5 w-5 stroke-brand-tertiary" />
              <AlertDescription className="text-xs font-bold ml-2 text-brand-primary">
                {successMsg}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}