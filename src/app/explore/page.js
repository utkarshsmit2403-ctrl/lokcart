"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { detectDistrictFromSearch } from "@/data/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, MapPin, SearchX, Globe, LayoutGrid, Scissors, 
  Leaf, Flower2, Gamepad2, ShieldCheck, Store, Truck, Filter, X, ChevronDown, Check, ArrowUpDown, SlidersHorizontal
} from "lucide-react";

const CRAFT_ORIGIN_CLUSTERS = [
  { id: "all", name: "All India Belts", state: "National", craft: "All Craft Clusters", icon: Globe },
  { id: "Bhagalpur", name: "Bhagalpur", state: "Bihar", craft: "Ahimsa Tussar Silk & Linen", icon: Scissors },
  { id: "Madhubani", name: "Madhubani", state: "Bihar", craft: "Mithila Folk Painting & Makhana", icon: Leaf },
  { id: "Varanasi", name: "Varanasi", state: "Uttar Pradesh", craft: "Banarasi Zari Brocade", icon: LayoutGrid },
  { id: "Gorakhpur", name: "Gorakhpur", state: "Uttar Pradesh", craft: "Black Clay Terracotta", icon: Flower2 },
  { id: "Saharanpur", name: "Saharanpur", state: "Uttar Pradesh", craft: "Carved Sheesham Wood", icon: Gamepad2 },
];

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    products,
    productsLoading,
    districts,
    userLocation,
    getUserOwnDistrict,
    searchQuery,
    setSearchQuery,
    setIsDistrictModalOpen,
    originDistrictFilter: selectedOriginDistrict,
    setOriginDistrictFilter: setSelectedOriginDistrict,
    radiusFilter: selectedRadius,
    setRadiusFilter: setSelectedRadius,
    categoryFilter: selectedCategory,
    setCategoryFilter: setSelectedCategory,
  } = useStore();
const SORT_OPTIONS = [
  { id: "nearest", label: "Distance: Nearest First" },
  { id: "rating", label: "Top Customer Rated" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

  const paramOrigin = searchParams?.get("originDistrict") || searchParams?.get("district") || "";
  const paramRadius = searchParams?.get("radius") || "all";
  const paramSearch = searchParams?.get("search") || "";

  const userOwnDistrict = getUserOwnDistrict ? getUserOwnDistrict() : (userLocation?.city || "");
  const districtFromSearch = detectDistrictFromSearch(paramSearch || searchQuery, districts);

  const [odopOnly, setOdopOnly] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (paramOrigin) setSelectedOriginDistrict(paramOrigin);
    else if (districtFromSearch) setSelectedOriginDistrict(districtFromSearch);
  }, [paramOrigin, districtFromSearch, setSelectedOriginDistrict]);

  useEffect(() => {
    if (paramRadius) setSelectedRadius(paramRadius);
  }, [paramRadius, setSelectedRadius]);

  useEffect(() => {
    if (paramSearch) setSearchQuery(paramSearch);
  }, [paramSearch, setSearchQuery]);

  const isViewingOwnDistrict =
    userOwnDistrict &&
    selectedOriginDistrict &&
    (selectedOriginDistrict.toLowerCase() === userOwnDistrict.toLowerCase() ||
      userOwnDistrict.toLowerCase().includes(selectedOriginDistrict.toLowerCase()) ||
      selectedOriginDistrict.toLowerCase().includes(userOwnDistrict.toLowerCase()));

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedOriginDistrict !== "all") {
          const matchDist =
            p.district.toLowerCase() === selectedOriginDistrict.toLowerCase() ||
            p.district.toLowerCase().includes(selectedOriginDistrict.toLowerCase()) ||
            selectedOriginDistrict.toLowerCase().includes(p.district.toLowerCase());
          if (!matchDist) return false;
        }
        if (selectedRadius === "5km" && p.distanceKm > 5.0) return false;
        if (selectedRadius === "10km" && p.distanceKm > 10.0) return false;
        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        if (odopOnly && !p.isOdop) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSeller = p.sellerName.toLowerCase().includes(q);
          const matchDistrict = p.district.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSeller && !matchDistrict) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "nearest") return a.distanceKm - b.distanceKm;
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedOriginDistrict, selectedRadius, selectedCategory, odopOnly, sortBy, searchQuery]);

  // Count active filters for mobile badge
  const activeFilterCount = 
    (selectedOriginDistrict !== "all" ? 1 : 0) + 
    (selectedRadius !== "all" ? 1 : 0) + 
    (selectedCategory !== "all" ? 1 : 0) + 
    (odopOnly ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-[32px]">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-bold text-brand-subtle mb-6 md:mb-8">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight className="opacity-60" />
          <span>Craft Catalog</span>
          <ChevronRight className="opacity-60" />
          <span className="text-brand-primary">
            {selectedOriginDistrict === "all"
              ? "All Indian Artisan Belts"
              : isViewingOwnDistrict
              ? `Your District (${selectedOriginDistrict})`
              : `${selectedOriginDistrict} Hub`}
          </span>
        </nav>

        {/* Premium Hero Header Strip */}
        <div className="bg-brand-secondary text-secondary-foreground rounded-card p-6 md:p-[40px] border border-brand-line shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-2xl md:text-[36px] font-bold text-secondary-foreground tracking-tight leading-none">
                Authentic ODOP & Regional Crafts
              </h1>
              {isViewingOwnDistrict ? (
                <Badge className="bg-brand-tertiary text-tertiary-foreground text-xs font-bold uppercase px-3 py-1 rounded-pill flex items-center gap-1.5 border-none shadow-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  Your Home District
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-brand-primary/50 text-primary-foreground border-brand-line/20 text-xs font-bold uppercase px-3 py-1 rounded-pill flex items-center gap-1.5 backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-tertiary" />
                  Direct Origin
                </Badge>
              )}
            </div>
            <p className="text-sm md:text-base text-secondary-foreground/80 max-w-2xl leading-relaxed font-medium">
              Order authentic creations handcrafted by master artisans in historic district clusters, delivered straight to your doorstep across India.
            </p>
          </div>

          {/* Location Delivery Picker */}
          <Button
            variant="outline"
            onClick={() => setIsDistrictModalOpen(true)}
            className="relative z-10 flex h-auto items-center gap-4 bg-card hover:bg-muted p-4 border-none text-left transition-transform hover:-translate-y-0.5 justify-start sm:w-auto w-full rounded-card shadow-md"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
              <MapPin className="text-brand-tertiary " />
            </div>
            <div className="flex flex-col gap-1 pr-2">
              <span className="text-[10px] font-bold uppercase text-brand-subtle tracking-wider leading-none">
                Delivering To
              </span>
              <span className="text-sm font-bold text-brand-primary flex items-center gap-1.5 leading-none">
                {userLocation ? `${userLocation.city}, ${userLocation.state}` : "Set delivery location"}
                <ChevronDown className="text-brand-subtle" />
              </span>
            </div>
          </Button>
        </div>


        {/* Discovery Layout: Sidebar + Grid Canvas */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Mobile Overlay Backdrop */}
          {isMobileFilterDrawerOpen && (
            <div 
              className="fixed inset-0 bg-brand-primary/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileFilterDrawerOpen(false)}
            />
          )}

          {/* ================= PREMIUM FILTER SIDEBAR ================= */}
          <aside 
            className={`
              fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] bg-card h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:z-auto
              lg:static lg:flex lg:w-[280px] lg:shrink-0 lg:h-auto lg:p-6 lg:rounded-card lg:border lg:border-brand-line lg:shadow-sm lg:sticky lg:top-[100px]
              ${isMobileFilterDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            {/* Header (Fixed on Mobile) */}
            <div className="p-5 lg:p-0 lg:pb-0 border-b border-brand-line lg:border-none shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-brand-primary">
                <SlidersHorizontal className=" text-brand-tertiary" />
                <h3 className="text-lg font-bold">Filters</h3>
              </div>
              
              {/* Mobile Close Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 lg:hidden rounded-md hover:bg-muted text-brand-subtle"
                onClick={() => setIsMobileFilterDrawerOpen(false)}
              >
                <X className="" />
              </Button>

              {/* Desktop Reset */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedOriginDistrict("all");
                    setSelectedRadius("all");
                    setSelectedCategory("all");
                    setOdopOnly(false);
                    setSearchQuery("");
                  }}
                  className="hidden lg:flex h-8 px-3 text-xs font-bold text-brand-subtle hover:text-brand-primary hover:bg-muted rounded-button"
                >
                  Reset All
                </Button>
              )}
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-0 lg:mt-6 space-y-8 custom-scrollbar">
              
              {/* 1. Craft Origin District */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider">
                    Origin District
                  </h4>
                  {userOwnDistrict && (
                    <button
                      onClick={() => setSelectedOriginDistrict(userOwnDistrict)}
                      className="text-[10px] font-bold text-brand-tertiary hover:underline flex items-center gap-1 uppercase tracking-wide"
                    >
                      <MapPin className="" />
                      My District
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {CRAFT_ORIGIN_CLUSTERS.map((c) => {
                    const isSelected = selectedOriginDistrict.toLowerCase() === c.id.toLowerCase();
                    const isUserDistrict = userOwnDistrict && c.name.toLowerCase() === userOwnDistrict.toLowerCase();
                    const IconComponent = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedOriginDistrict(c.id)}
                        className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-button text-sm transition-colors ${
                          isSelected
                            ? "bg-accent text-brand-tertiary font-bold"
                            : "text-brand-subtle font-medium hover:bg-muted hover:text-brand-primary"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconComponent className={`shrink-0 ${isSelected ? "text-brand-tertiary" : "text-brand-subtle"}`} />
                          <span className="truncate">{c.name}</span>
                        </div>
                        {isUserDistrict && (
                          <Badge variant="outline" className={`h-5 text-[10px] px-1.5 rounded-sm uppercase font-bold border ${isSelected ? "bg-card text-brand-tertiary border-brand-tertiary/30" : "bg-card text-brand-subtle border-brand-line"}`}>
                            Home
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-brand-line" />

              {/* 2. Delivery Speed */}
              <div>
                <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-4">
                  Speed & Distance
                </h4>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: "all", label: "Pan-India Express", icon: Globe },
                    { id: "10km", label: "Within 10 km (3-Hr)", icon: Truck },
                    { id: "5km", label: "Within 5 km (Instant)", icon: Store },
                  ].map((r) => {
                    const isSelected = selectedRadius === r.id;
                    const IconComponent = r.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRadius(r.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-button text-sm transition-colors ${
                          isSelected
                            ? "bg-accent text-brand-tertiary font-bold"
                            : "text-brand-subtle font-medium hover:bg-muted hover:text-brand-primary"
                        }`}
                      >
                        <IconComponent className={`shrink-0 ${isSelected ? "text-brand-tertiary" : "text-brand-subtle"}`} />
                        <span className="truncate">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-brand-line" />

              {/* 3. Category */}
              <div>
                <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-4">
                  Category
                </h4>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: "all", label: "All Disciplines", icon: LayoutGrid },
                    { id: "sarees", label: "Handloom & Silk", icon: Scissors },
                    { id: "food", label: "Natural Foods", icon: Leaf },
                    { id: "terracotta", label: "Clay & Pottery", icon: Flower2 },
                    { id: "woodwork", label: "Woodcraft & Toys", icon: Gamepad2 },
                  ].map((c) => {
                    const isSelected = selectedCategory === c.id;
                    const IconComponent = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-button text-sm transition-colors ${
                          isSelected
                            ? "bg-accent text-brand-tertiary font-bold"
                            : "text-brand-subtle font-medium hover:bg-muted hover:text-brand-primary"
                        }`}
                      >
                        <IconComponent className={`shrink-0 ${isSelected ? "text-brand-tertiary" : "text-brand-subtle"}`} />
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-brand-line" />

              {/* 4. Authenticity Seal */}
              <div className="pb-4 lg:pb-0">
                <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-4">
                  Certification
                </h4>
                <label className={`flex items-center justify-between cursor-pointer group p-3 rounded-button border transition-colors ${
                   odopOnly ? 'bg-accent border-brand-tertiary/30' : 'bg-card border-brand-line hover:border-brand-tertiary/50 hover:bg-muted'
                 }`}>
                   <div className="flex items-center gap-3">
                     <ShieldCheck className={` ${odopOnly ? 'text-brand-tertiary' : 'text-brand-subtle'}`} />
                     <span className="text-sm font-bold text-brand-primary select-none">ODOP Only</span>
                   </div>
                   <div className={` rounded-[4px] border flex items-center justify-center transition-colors ${
                     odopOnly ? 'bg-brand-tertiary border-brand-tertiary text-primary-foreground' : 'border-brand-line bg-card group-hover:border-brand-subtle'
                   }`}>
                     {odopOnly && <Check className="w-3.5 h-3.5" />}
                   </div>
                 </label>
              </div>
            </div>

            {/* Mobile Filter Footer (Fixed) */}
            <div className="lg:hidden p-4 bg-card border-t border-brand-line shrink-0 flex items-center gap-3">
              {activeFilterCount > 0 && (
                 <Button
                   variant="outline"
                   onClick={() => {
                     setSelectedOriginDistrict("all");
                     setSelectedRadius("all");
                     setSelectedCategory("all");
                     setOdopOnly(false);
                     setSearchQuery("");
                   }}
                   className="h-[48px] px-4 rounded-button font-bold text-brand-subtle border-brand-line"
                 >
                   Reset
                 </Button>
              )}
              <Button 
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="flex-1 bg-brand-primary text-primary-foreground rounded-button h-[48px] text-sm font-bold hover:bg-primary-hover shadow-sm"
              >
                Show {filteredProducts.length} Results
              </Button>
            </div>
          </aside>

          {/* ================= PRODUCT RESULTS CANVAS ================= */}
          <section className="flex-1 min-w-0 w-full space-y-[24px]">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-card border border-brand-line shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Toggle Button */}
                <Button 
                  variant="outline"
                  onClick={() => setIsMobileFilterDrawerOpen(true)}
                  className="lg:hidden flex h-[44px] items-center justify-center gap-2 rounded-button border-brand-line text-brand-primary hover:bg-muted shadow-sm flex-1 sm:flex-none"
                >
                  <Filter className="text-brand-tertiary" />
                  <span className="text-sm font-bold">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center bg-brand-tertiary text-white text-[10px] rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <span className="hidden sm:inline-block text-base font-bold text-brand-primary truncate">
                  {filteredProducts.length} verified listings
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end relative">
                <label className="hidden sm:block text-xs uppercase font-bold text-brand-subtle tracking-wider whitespace-nowrap">
                  Sort By
                </label>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto appearance-none text-sm h-[44px] pl-4 pr-10 rounded-input bg-card border border-brand-line text-brand-primary font-bold focus:ring-1 focus:ring-brand-tertiary outline-none cursor-pointer shadow-sm hover:bg-muted transition-colors"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle pointer-events-none" />
                </div>
              </div>
              
              {/* Mobile Result Count (shown under sort on very small screens) */}
              <div className="sm:hidden text-center w-full">
                 <span className="text-sm font-medium text-brand-subtle">
                  Showing {filteredProducts.length} items
                </span>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[24px]">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-card border border-brand-line p-4 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <Skeleton className="w-full aspect-[4/5] rounded-card" />
                      <div className="pt-4 space-y-2">
                        <Skeleton className="h-3 w-1/3 rounded-sm" />
                        <Skeleton className="h-4 w-4/5 rounded-sm" />
                        <Skeleton className="h-3 w-1/2 rounded-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-[100px] bg-card rounded-card border border-brand-line px-[24px] shadow-sm">
                <div className="w-[80px] h-[80px] bg-muted rounded-full flex items-center justify-center mb-6 text-brand-subtle border border-brand-line shadow-sm">
                  <SearchX className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary">
                  No craft listings found
                </h3>
                <p className="text-base text-brand-subtle mt-3 max-w-[380px] leading-relaxed font-medium">
                  Try viewing crafts from other historic clusters or clear your active filters.
                </p>
                <Button
                  onClick={() => {
                    setSelectedOriginDistrict("all");
                    setSelectedRadius("all");
                    setSelectedCategory("all");
                    setOdopOnly(false);
                    setSearchQuery("");
                  }}
                  className="mt-8 px-8 h-[48px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-md"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[24px]">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-tertiary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
