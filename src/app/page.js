"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";

import { MapPin, LocateFixed, ArrowRight, ShieldCheck, Zap, ChevronRight, Star } from "lucide-react";


const RADIUS_OPTIONS = [
  { id: "all", label: "All nearby" },
  { id: "5km", label: "Within 5 km" },
  { id: "10km", label: "Within 10 km" },
  { id: "district", label: "My area" },
];

export default function HomePage() {
  const router = useRouter();
  const {
    districts,
    userLocation,
    getUserOwnDistrict,
    fetchLocationByPincode,
    detectUserLocation,
    locationLoading,
    locationError,
    products,
    productsLoading,
    sellers,
    setIsDistrictModalOpen,
  } = useStore();

  const [heroPin, setHeroPin] = useState("");
  const [activeRadius, setActiveRadius] = useState("all");
  const [pinFeedback, setPinFeedback] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!cancelled && data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const userOwnDistrict = getUserOwnDistrict ? getUserOwnDistrict() : (userLocation?.city || "");

  const handleHeroPinSubmit = async (e) => {
    e.preventDefault();
    const clean = heroPin.trim();
    if (!clean) return;
    setPinFeedback(null);

    if (!/^\d{6}$/.test(clean)) {
      setPinFeedback({ type: "error", text: "Enter a valid 6-digit PIN code." });
      return;
    }

    const res = await fetchLocationByPincode(clean);
    if (res.success) {
      setPinFeedback({ type: "success", text: `Delivering to ${res.data.city}, ${res.data.state}` });
    } else {
      setPinFeedback({ type: "error", text: "We couldn't find that PIN code." });
    }
  };

  const filteredNearbyProducts = products
    .filter((p) => {
      if (activeRadius === "5km") return p.distanceKm <= 5.0;
      if (activeRadius === "10km") return p.distanceKm <= 10.0;
      if (activeRadius === "district" && userOwnDistrict) {
        return (
          p.district.toLowerCase() === userOwnDistrict.toLowerCase() ||
          p.district.toLowerCase().includes(userOwnDistrict.toLowerCase()) ||
          userOwnDistrict.toLowerCase().includes(p.district.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (userOwnDistrict) {
        const aOwn = a.district.toLowerCase() === userOwnDistrict.toLowerCase();
        const bOwn = b.district.toLowerCase() === userOwnDistrict.toLowerCase();
        if (aOwn && !bOwn) return -1;
        if (!aOwn && bOwn) return 1;
      }
      return a.distanceKm - b.distanceKm;
    });

  return (
    <div className="flex min-h-screen flex-col bg-background text-brand-primary antialiased">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="w-full border-b border-brand-line bg-card py-12">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
          <div className="flex flex-col space-y-6 lg:col-span-7 justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-subtle">
              <Zap className="h-4 w-4 text-brand-tertiary" />
              ODOP &amp; GI-tag verified sellers
              {mounted && userLocation && (
                <>
                  <span className="text-brand-line">·</span>
                  <span>{userLocation.city}, {userLocation.state}</span>
                </>
              )}
            </div>

            <h1 className="text-[32px] sm:text-[40px] lg:text-[56px] font-bold leading-[1.1] tracking-tight text-brand-primary">
              Discover the crafts that tell your district's story.
            </h1>

            <p className="max-w-xl text-md sm:text-lg text-brand-subtle font-medium leading-relaxed">
              Shop handloom sarees, terracotta art, organic makhana and regional treasures direct from certified local artisans — starting 5 km from your doorstep.
            </p>

            {/* Location / pincode bar */}
            <Card className="rounded-card border-brand-line shadow-sm bg-muted mt-2">
              <CardContent className="p-4 sm:p-5">
                <form onSubmit={handleHeroPinSubmit} className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2  text-brand-subtle" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={heroPin}
                      onChange={(e) => {
                        setHeroPin(e.target.value);
                        setPinFeedback(null);
                      }}
                      placeholder="Enter delivery PIN — e.g. 823001"
                      className="h-[48px] rounded-input border-brand-line bg-card pl-[40px] text-sm font-semibold focus-visible:border-brand-tertiary focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={!heroPin.trim() || locationLoading}
                      className="h-[48px] flex-1 rounded-button bg-brand-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary-hover shadow-sm sm:flex-none"
                    >
                      {locationLoading ? "Checking…" : "Check delivery"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={detectUserLocation}
                      disabled={locationLoading}
                      title="Use current location"
                      className="h-[48px] w-[48px] rounded-button border-brand-line bg-card p-0 text-brand-tertiary hover:bg-brand-line shadow-sm shrink-0"
                    >
                      <LocateFixed className="" />
                    </Button>
                  </div>
                </form>

                {pinFeedback && (
                  <p
                    className={`mt-3 text-xs font-bold flex items-center gap-1 ${
                      pinFeedback.type === "error" ? "text-destructive" : "text-brand-tertiary"
                    }`}
                  >
                    {pinFeedback.text}
                  </p>
                )}
                {locationError && !pinFeedback && (
                  <p className="mt-3 text-xs font-bold text-destructive">{locationError}</p>
                )}

                <Separator className="my-4 bg-brand-line" />

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsDistrictModalOpen(true)}
                    className="font-bold text-brand-tertiary hover:underline"
                  >
                    {userLocation ? `Change delivery address (${userLocation.city})` : "Set exact delivery address"}
                  </button>
                  <Link href="/explore" className="flex items-center gap-1 font-bold text-brand-tertiary hover:underline">
                    Browse full catalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-5 pt-2 text-xs font-bold text-brand-subtle">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-tertiary" />
                Quality checked before dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-brand-tertiary" />
                ODOP ONDC Platform
              </span>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative lg:col-span-5 flex items-center">
            <div className="overflow-hidden rounded-card border border-brand-line shadow-sm w-full">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAndSMzdpcH8Iq3CByVkkrgnUSjjwVDN5-upCJx3GS8l-3O2H1CqidzjMckmqh7pOM8rM20TnvTgITicTHZB5nlCK-BnJ5PFGhZ97si5959EyJvb_gIn0Nr8aGbs0todROrAC3TnEKkvLIS8_jN4ql-9FYi1OX1AxfNeRPbUY4nLXxk7nGOhfp5gnBrMhJth3pqjuisIgTIPeZz-ib_cW_PaJi_tBnrGI_F25VZW5i729KErIG2TB0aHQ"
                alt="Authentic crafts packed for delivery"
                className="h-[380px] w-full object-cover md:h-[480px]"
              />
            </div>

            <Card className="absolute inset-x-4 bottom-4 rounded-card border-brand-line shadow-md bg-card/95 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4">
               <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVFREnTdLfO74cNz2A-QS7HJ4Ls_F8kMwliSnNW-9ZovALSlVA1YdUw3puqiRuONM4DpK7fr1KFKraoTDzCsC480RhsU8pITU8PnAlSjmguh59uTqsID4PnJYOkRowlVhDpwX-q_n6W3jybUcfKR07nCpSF5me5fLUJw2GtjFq_5w1-yuRzeWekGdbEFEqr_fOMmuFTzRFJxgbbqIvJufGeJbASDaoXK3q60QPjtRGzkhndIuaEDr_lg"
                  alt="Sunita Devi"
                  className="h-[48px] w-[48px] shrink-0 rounded-full border-2 border-brand-tertiary object-cover shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand-primary">Sunita Devi Crafts</p>
                  <p className="truncate text-xs font-medium text-brand-subtle">Madhubani folk art · 4.9 ★ · 342 orders</p>
                </div>
                <Button asChild size="sm" className="h-[36px] shrink-0 rounded-button bg-brand-primary px-4 text-xs font-bold text-primary-foreground">
                  <Link href="/products/prod-1">View</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    {/* ================= CATEGORIES ================= */}
      <section className="w-full border-b border-brand-line bg-card py-[56px]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-brand-primary md:text-[32px]">
                Shop by category
              </h2>
              <p className="mt-2 max-w-xl text-sm font-medium text-brand-subtle">
                Everything you need, sorted from handloom silks to natural foods.
              </p>
            </div>
            <Link href="/categories" className="flex items-center gap-1 text-sm font-bold text-brand-tertiary hover:underline">
              View all categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categoriesLoading
              ? [...Array(4)].map((_, i) => (
                  <Card key={i} className="h-full rounded-card border-brand-line bg-muted/10 shadow-sm">
                    <CardContent className="flex flex-col items-center gap-4 p-5 text-center">
                      <Skeleton className="h-[80px] w-[80px] rounded-full sm:h-[100px] sm:w-[100px]" />
                      <div className="flex w-full flex-col items-center gap-2">
                        <Skeleton className="h-4 w-3/4 rounded-sm" />
                        <Skeleton className="h-3 w-full rounded-sm" />
                        <Skeleton className="mt-2 h-5 w-16 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : categories.map((cat) => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`} className="group h-full">
                    <Card className="h-full rounded-card border-brand-line bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-tertiary hover:shadow-md">
                      <CardContent className="flex h-full flex-col items-center justify-between gap-4 p-5 text-center">
                        
                        {/* Image Wrapper with Hover Ring */}
                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-transparent transition-colors duration-300 group-hover:border-brand-tertiary/30" />
                          <div className="h-[80px] w-[80px] overflow-hidden rounded-full border border-brand-line bg-muted shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-[100px] sm:w-[100px]">
                            <img
                              src={cat.bannerImage}
                              alt={cat.label}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col items-center gap-1.5">
                          <h3 className="text-sm font-bold leading-tight text-brand-primary transition-colors group-hover:text-brand-tertiary sm:text-base">
                            {cat.label}
                          </h3>
                          <p className="line-clamp-2 text-xs font-medium text-brand-subtle">
                            {cat.subtitle}
                          </p>
                          
                          {/* Utilizing API data for product counts */}
                          <span className="mt-2 inline-flex items-center rounded-full bg-brand-tertiary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-tertiary">
                            {cat.productCount} {cat.productCount === 1 ? "Item" : "Items"}
                          </span>
                        </div>
                        
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ================= AVAILABLE NEAR YOU ================= */}
      <section id="near-me" className="w-full border-b border-brand-line bg-muted/10 py-[56px]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-brand-primary md:text-[32px]">
                {userLocation ? `Available near ${userLocation.city}` : "Available near you"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium text-brand-subtle">
                {userLocation
                  ? `In-stock items near ${userLocation.city}, delivered via hyperlocal runner.`
                  : "Set your delivery address to see items in stock within 5–10 km."}
              </p>
            </div>

            <Tabs value={activeRadius} onValueChange={setActiveRadius}>
              <TabsList className="bg-card border border-brand-line shadow-sm h-[44px]">
                {RADIUS_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.id} value={opt.id} className="text-xs font-bold data-[state=active]:bg-brand-primary data-[state=active]:text-primary-foreground px-4 h-full">
                    {opt.id === "district" && userLocation?.city ? `Area (${userLocation.city})` : opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="rounded-card border-brand-line shadow-sm bg-card">
                  <CardContent className="space-y-4 p-4">
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="h-3 w-1/3 rounded-sm" />
                    <Skeleton className="h-4 w-4/5 rounded-sm" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-6 w-16 rounded-sm" />
                      <Skeleton className="h-[36px] w-[80px] rounded-button" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredNearbyProducts.slice(0,8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-[40px] text-center">
            <Button asChild variant="outline" className="h-[48px] rounded-button border-brand-line bg-card px-8 text-sm font-bold text-brand-primary shadow-sm hover:bg-muted">
              <Link href="/explore" className="flex items-center gap-2">
                Explore all {products.length} items
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    {/* ================= SHOP BY AREA ================= */}
      <section id="areas" className="w-full border-b border-brand-line bg-card py-[56px]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="mx-auto mb-[48px] max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-brand-primary md:text-[36px]">
              One District, One Product
            </h2>
            <p className="mt-3 text-sm font-medium text-brand-subtle md:text-base leading-relaxed">
              Every district holds its own unique craft tradition. Explore India's authentic heritage, district by district.
            </p>
          </div>

          {/* District Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {districts.map((dist) => (
              <Link 
                key={dist.id} 
                href={`/explore?originDistrict=${dist.name}`}
                className="group flex flex-col h-full overflow-hidden rounded-card border border-brand-line bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-tertiary/50 hover:shadow-md"
              >
                {/* Image & Badge Area */}
                <div className="relative h-[180px] w-full overflow-hidden bg-muted shrink-0 border-b border-brand-line/50">
                  <img 
                    src={dist.image} 
                    alt={`${dist.name} Crafts`} 
                    loading="lazy" 
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <Badge className="absolute top-3 left-3 bg-card/95 text-brand-primary border-brand-line shadow-sm backdrop-blur-md text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                    {dist.badge}
                  </Badge>
                </div>
                
                {/* Content Area */}
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    {/* Typography Hierarchy */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtle mb-1">
                      {dist.state}
                    </p>
                    <h3 className="text-lg font-bold text-brand-primary leading-tight mb-3">
                      {dist.name} District
                    </h3>
                    
                    {/* ODOP Pill */}
                    <span className="inline-flex items-center rounded-sm bg-brand-tertiary/10 px-2 py-0.5 text-[11px] font-bold text-brand-tertiary mb-3 border border-brand-tertiary/20">
                      {dist.activeOdop}
                    </span>
                    
                    <p className="line-clamp-2 text-sm font-medium leading-relaxed text-brand-subtle mb-5">
                      {dist.tagline}
                    </p>
                  </div>

                  {/* Visual Button (Action Area) */}
                  <div className="mt-auto flex h-[40px] w-full items-center justify-between rounded-button border border-brand-line bg-card px-4 text-xs font-bold text-brand-primary transition-colors duration-300 group-hover:border-brand-tertiary group-hover:bg-brand-tertiary group-hover:text-tertiary-foreground shadow-sm">
                    <span>Explore ({dist.artisanCount} stores)</span>
                    <ArrowRight className="h-4 w-4 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </CardContent>
              </Link>
            ))}
          </div>
          
        </div>
      </section>
      {/* ================= FEATURED SELLERS & BRANDS ================= */}
      <section id="stores" className="w-full border-b border-brand-line bg-muted/10 py-[56px]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-brand-primary md:text-[32px]">
                Meet the Artisans & Brands
              </h2>
              <p className="mt-2 max-w-xl text-sm font-medium text-brand-subtle">
                Every listing is traceable to a verified ODOP/GI artisan store — visit their page to see their full catalog.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sellers.slice(0, 8).map((seller) => (
              <Link key={seller.id} href={`/brand/${seller.id}`} className="group">
                <Card className="h-full overflow-hidden rounded-card border-brand-line shadow-sm transition-colors duration-200 group-hover:border-brand-tertiary group-hover:shadow-md">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-card border border-brand-line bg-muted">
                        <img src={seller.avatar} alt={seller.name} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-brand-primary">{seller.name}</h3>
                        <p className="truncate text-xs font-medium text-brand-subtle">{seller.district}, {seller.state}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-brand-subtle">
                      {seller.category}
                    </p>
                    <div className="flex items-center justify-between border-t border-brand-line pt-3">
                      <span className="flex items-center gap-1 text-xs font-bold text-brand-primary">
                        <Star className="h-3.5 w-3.5 fill-brand-tertiary text-brand-tertiary" />
                        {seller.rating}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-brand-tertiary opacity-0 transition-opacity group-hover:opacity-100">
                        Visit Store
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
