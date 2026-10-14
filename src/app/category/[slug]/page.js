"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  ChevronRight,
  SearchX,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Check
} from "lucide-react";

const SORT_OPTIONS = [
  { id: "nearest", label: "Distance: Nearest First" },
  { id: "rating", label: "Top Customer Rated" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

export default function CategoryPage({ params }) {
  const { slug } = use(params);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [odopOnly, setOdopOnly] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");

  // Fetch specific category details
  useEffect(() => {
    let cancelled = false;
    async function loadCategory() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!cancelled && data.success) {
          setCategory(data.categories.find((c) => c.slug === slug) || null);
        }
      } catch (err) {
        console.error("Failed to load category", err);
      }
    }
    loadCategory();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Fetch Products for this category
  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load category products", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProducts();
    setActiveSubcategory("all");
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visibleProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeSubcategory !== "all" && p.categoryLabel !== activeSubcategory) return false;
        if (odopOnly && !p.isOdop) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "nearest") return a.distanceKm - b.distanceKm;
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [products, activeSubcategory, odopOnly, sortBy]);

  const subcategories = category?.subcategories || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-[32px]">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-bold text-brand-subtle mb-8">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight className="opacity-60" />
          <Link href="/categories" className="hover:text-brand-tertiary transition-colors">Categories</Link>
          <ChevronRight className="opacity-60" />
          <span className="text-brand-primary">{category?.label || slug}</span>
        </nav>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ============= LEFT SIDEBAR (Desktop Filters) ============= */}
          <aside className="hidden lg:flex w-[280px] shrink-0 flex-col gap-6 sticky top-[100px]">
            <div className="bg-card border border-brand-line rounded-card p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <Filter className=" text-brand-tertiary" />
                <h3 className="font-bold text-brand-primary text-lg">Filters</h3>
              </div>

              {/* Subcategories Filter (Professional List UI) */}
              {subcategories.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-4">Categories</h4>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setActiveSubcategory("all")}
                      className={`text-left px-3 py-2.5 rounded-button text-sm transition-colors ${
                        activeSubcategory === "all"
                          ? "bg-accent text-brand-tertiary font-bold"
                          : "text-brand-subtle font-medium hover:bg-muted hover:text-brand-primary"
                      }`}
                    >
                      All {category?.label?.split(" ")[0] || "Items"}
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setActiveSubcategory(sub)}
                        className={`text-left px-3 py-2.5 rounded-button text-sm transition-colors ${
                          activeSubcategory === sub
                            ? "bg-accent text-brand-tertiary font-bold"
                            : "text-brand-subtle font-medium hover:bg-muted hover:text-brand-primary"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ODOP Filter (Card Checkbox UI) */}
              <div className="mb-8">
                 <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-4">Certification</h4>
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

              <hr className="border-brand-line my-6" />

              {/* Sort Filter */}
              <div>
                <h4 className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-4">Sort By</h4>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none text-sm h-[44px] pl-4 pr-10 rounded-input bg-card border border-brand-line text-brand-primary font-bold focus:border-brand-tertiary focus:ring-1 focus:ring-brand-tertiary outline-none cursor-pointer hover:bg-muted transition-colors shadow-sm"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2  text-brand-subtle pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* ============= RIGHT MAIN CONTENT ============= */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* Category Banner with Real Image */}
            <div className="bg-brand-secondary text-secondary-foreground rounded-card border border-brand-line shadow-sm mb-8 p-6 md:p-[40px] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-6">
                
                {/* Category Image Avatar */}
                <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-muted rounded-full shrink-0 shadow-md border-4 border-card overflow-hidden">
                  {category?.bannerImage ? (
                    <img 
                      src={category.bannerImage} 
                      alt={category.label} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>

                <div>
                  <h1 className="text-2xl md:text-[36px] font-bold text-secondary-foreground tracking-tight leading-tight mb-2">
                    {category?.label || "Loading category…"}
                  </h1>
                  <p className="text-base font-medium text-secondary-foreground/80">
                    {category?.subtitle}
                    {category ? ` · ${category.productCount} listings` : ""}
                  </p>
                </div>
              </div>

              {category?.odopCount > 0 && (
                <div className="relative z-10 bg-brand-primary/40 border border-brand-line/10 text-primary-foreground text-sm font-bold px-5 py-3 rounded-button flex items-center gap-2.5 w-fit shrink-0 backdrop-blur-sm">
                  <ShieldCheck className=" text-brand-tertiary" />
                  {category.odopCount} ODOP Certified
                </div>
              )}
            </div>

            {/* Mobile Controls (Hidden on Desktop) */}
            <div className="lg:hidden flex flex-col gap-5 mb-8">
              {/* Mobile Subcategory Chips */}
              {subcategories.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
                  <Button
                    size="sm"
                    variant={activeSubcategory === "all" ? "default" : "outline"}
                    onClick={() => setActiveSubcategory("all")}
                    className={`shrink-0 h-[40px] rounded-pill text-sm font-bold px-5 ${
                      activeSubcategory === "all"
                        ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                        : "bg-card text-brand-primary border-brand-line hover:bg-muted"
                    }`}
                  >
                    All Items
                  </Button>
                  {subcategories.map((sub) => (
                    <Button
                      key={sub}
                      size="sm"
                      variant={activeSubcategory === sub ? "default" : "outline"}
                      onClick={() => setActiveSubcategory(sub)}
                      className={`shrink-0 h-[40px] rounded-pill text-sm font-bold px-5 whitespace-nowrap ${
                        activeSubcategory === sub
                          ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                          : "bg-card text-brand-primary border-brand-line hover:bg-muted"
                      }`}
                    >
                      {sub}
                    </Button>
                  ))}
                </div>
              )}

              {/* Mobile Sort & Filter Bar */}
              <div className="flex items-center justify-between gap-4 bg-card p-3 rounded-card border border-brand-line shadow-sm">
                 <button
                   onClick={() => setOdopOnly(!odopOnly)}
                   className={`flex items-center gap-2 rounded-button border px-4 py-2.5 text-sm font-bold transition-colors ${
                     odopOnly
                       ? "bg-brand-tertiary text-primary-foreground border-brand-tertiary shadow-sm"
                       : "bg-muted text-brand-primary border-brand-line"
                   }`}
                 >
                   <ShieldCheck className="" />
                   ODOP
                 </button>
                 <div className="relative flex-1 max-w-[180px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none text-sm h-[42px] pl-4 pr-10 rounded-input bg-muted border border-brand-line text-brand-primary font-bold focus:outline-none focus:ring-1 focus:ring-brand-tertiary"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>{o.label.split(":")[0]}</option> // Shorter label for mobile
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-subtle pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Grid Header */}
            <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-brand-line">
              <h2 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                {activeSubcategory === "all" ? "All Products" : activeSubcategory}
                <Badge variant="outline" className="ml-2 bg-muted text-brand-subtle border-brand-line text-xs">
                  {visibleProducts.length} items
                </Badge>
              </h2>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[24px]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-card border border-brand-line p-4 space-y-4 shadow-sm">
                    <Skeleton className="w-full aspect-[4/5] rounded-card" />
                    <Skeleton className="h-4 w-1/3 rounded-sm" />
                    <Skeleton className="h-5 w-4/5 rounded-sm" />
                  </div>
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-[100px] bg-muted rounded-card border border-brand-line px-[24px]">
                <div className="w-[80px] h-[80px] bg-card rounded-full flex items-center justify-center mb-6 text-brand-subtle border border-brand-line shadow-sm">
                  <SearchX className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-brand-primary">No matching items found</h3>
                <p className="text-base text-brand-subtle mt-3 max-w-[380px] leading-relaxed font-medium">
                  Try selecting a different subcategory or clear the ODOP filter to see more items.
                </p>
                <Button 
                  onClick={() => { setActiveSubcategory("all"); setOdopOnly(false); }}
                  className="mt-8 px-8 h-[48px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-sm"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[24px]">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
