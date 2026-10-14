"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowRight, ShieldCheck } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!cancelled && data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-[40px]">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-bold text-brand-subtle mb-6">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-brand-primary">Shop by Category</span>
        </nav>

        <div className="mb-[32px]">
          <h1 className="text-2xl md:text-[32px] font-bold text-brand-primary tracking-tight leading-none">
            Shop by Category
          </h1>
          <p className="text-sm text-brand-subtle max-w-2xl leading-relaxed font-medium mt-2">
            Browse authentic ODOP &amp; GI-tagged crafts grouped by craft type, sourced directly from district clusters across India.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[16px] md:gap-[24px]">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[16px] md:gap-[24px]">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-brand-line bg-card shadow-sm transition-all hover:border-brand-tertiary hover:shadow-md aspect-[4/3]"
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={cat.bannerImage}
                    alt={cat.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                <div className="relative z-10 flex items-start justify-end p-[20px]">
                  {cat.odopCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-card/90 text-brand-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-pill flex items-center gap-1 border-brand-line shadow-sm"
                    >
                      <ShieldCheck className="h-3 w-3 text-brand-tertiary" />
                      ODOP
                    </Badge>
                  )}
                </div>

                <div className="relative z-10 p-[20px]">
                  <h3 className="text-md sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-1 truncate">
                    {cat.subtitle}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-white/90">
                      {cat.productCount} listings
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
