"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  MapPin,
  Star,
  ShieldCheck,
  BadgeCheck,
  Phone,
  MessageCircle,
  Mail,
  Package,
  SearchX,
  ShoppingBag,
  Truck,
  Award,
  Share2,
  Sparkles,
  Layers,
  CheckCircle2,
  Building2,
  Eye,
  Check,
  X,
  ExternalLink
} from "lucide-react";

function digitsOnly(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

const SORT_OPTIONS = [
  { id: "nearest", label: "Nearest First" },
  { id: "rating", label: "Top Rated" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

export default function BrandPage({ params }) {
  const { id } = use(params);

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("nearest");
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/sellers/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.seller) {
          setSeller(data.seller);
          setProducts(data.products || []);
          setCategoryBreakdown(data.categoryBreakdown || []);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load seller", err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    setActiveCategory("all");
    return () => {
      cancelled = true;
    };
  }, [id]);

  const visibleProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeCategory === "all") return true;
        return (
          p.category === activeCategory ||
          p.categoryLabel === activeCategory
        );
      })
      .sort((a, b) => {
        if (sortBy === "nearest") return (a.distanceKm || 0) - (b.distanceKm || 0);
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, activeCategory, sortBy]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-[32px] space-y-8">
          <div className="space-y-4">
            <Skeleton className="w-48 h-4 rounded-xs" />
            <Skeleton className="w-full h-[320px] rounded-card" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-28 h-10 rounded-pill" />
            <Skeleton className="w-28 h-10 rounded-pill" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-card" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-[100px]">
          <div className="w-[80px] h-[80px] bg-muted rounded-full flex items-center justify-center mb-6 text-brand-subtle border border-brand-line shadow-sm">
            <SearchX className="h-10 w-10 text-brand-subtle" />
          </div>
          <h3 className="text-xl font-bold text-brand-primary">Artisan Store Not Found</h3>
          <p className="text-sm text-brand-subtle mt-3 max-w-[380px] leading-relaxed font-medium">
            This artisan or seller store page doesn&apos;t exist or may have been moved.
          </p>
          <Link href="/explore">
            <Button className="mt-[32px] px-8 h-[44px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-md">
              Browse Craft Catalog
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Namaste ${seller.artisan || seller.name}! I found your store on LokKart and I'm interested in your handcrafted ODOP products.`
  );

  const bannerImg = seller.coverBanner || seller.banner || "/images/sunita-devi-cover.jpg";
  const avatarImg = seller.avatar || "/images/sunita-devi.jpg";
  const galleryImages = seller.gallery && seller.gallery.length > 0 ? seller.gallery : [
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-[32px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-bold text-brand-subtle mb-6">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <Link href="/explore" className="hover:text-brand-tertiary transition-colors">Craft Catalog</Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="text-brand-primary truncate font-bold">{seller.name}</span>
        </nav>

        {/* ============= Premium Brand Banner Header ============= */}
        <div className="bg-card rounded-card border border-brand-line shadow-sm overflow-hidden mb-10">
          
          {/* Banner Hero Image */}
          <div className="relative h-[220px] sm:h-[280px] md:h-[340px] w-full overflow-hidden bg-brand-primary">
            <img
              src={bannerImg}
              alt={seller.name}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
            />
            {/* Gradient Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            
            {/* Banner Floating Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 flex-wrap">
                {seller.verified && (
                  <Badge className="bg-brand-tertiary/90 hover:bg-brand-tertiary text-tertiary-foreground border-none text-xs px-3 py-1 font-bold rounded-pill shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Government Verified Master Artisan
                  </Badge>
                )}
                {seller.badgeTier && (
                  <Badge className="bg-brand-primary/80 hover:bg-brand-primary text-primary-foreground border border-white/20 text-xs px-3 py-1 font-bold rounded-pill shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {seller.badgeTier}
                  </Badge>
                )}
              </div>

              <Button
                onClick={handleShare}
                variant="outline"
                className="h-[36px] px-3.5 rounded-button bg-card/90 hover:bg-card border-brand-line text-brand-primary font-bold text-xs shadow-md backdrop-blur-md flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-brand-subtle" />}
                <span>{copiedLink ? "Link Copied!" : "Share Store"}</span>
              </Button>
            </div>

            {/* Banner Bottom Details */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="text-white space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
                  {seller.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{seller.address || `${seller.district}, ${seller.state}`}</span>
                </p>
              </div>

              {/* Desktop Quick Stats */}
              <div className="hidden md:flex items-center gap-4 bg-card/95 border border-brand-line rounded-card px-5 py-3 shadow-lg backdrop-blur-md text-brand-primary">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-extrabold">
                    {seller.rating || 4.9} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-brand-subtle font-bold">Rating ({seller.reviewsCount || 142})</div>
                </div>
                <div className="w-[1px] h-8 bg-brand-line"></div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-brand-primary font-stack">{seller.ordersCount || 342}+</div>
                  <div className="text-[10px] uppercase tracking-wider text-brand-subtle font-bold">Orders</div>
                </div>
                <div className="w-[1px] h-8 bg-brand-line"></div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-brand-primary font-stack">{seller.viewsCount || 3820}</div>
                  <div className="text-[10px] uppercase tracking-wider text-brand-subtle font-bold">Views</div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlapping Avatar & Main Information Grid */}
          <div className="relative px-4 sm:px-6 pb-8 md:px-10 md:pb-10 bg-card rounded-b-card">
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              
              {/* Avatar Column */}
              <div className="-mt-14 sm:-mt-16 md:-mt-20 relative z-20 shrink-0 self-start flex flex-col items-center sm:items-start">
                <div className="relative group">
                  <Avatar className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[140px] md:h-[140px] rounded-card border-4 border-card shadow-xl bg-muted overflow-hidden">
                    <AvatarImage src={avatarImg} alt={seller.name} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <AvatarFallback className="rounded-card bg-brand-primary text-primary-foreground text-3xl font-extrabold">
                      {seller.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>

                  {seller.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-brand-tertiary text-tertiary-foreground p-2 rounded-full shadow-md border-2 border-card" title="Verified Master Artisan">
                      <BadgeCheck className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center sm:text-left space-y-0.5">
                  <div className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">Master Artisan</div>
                  <div className="text-base font-bold text-brand-primary">{seller.artisan || seller.name}</div>
                  {seller.memberSince && (
                    <div className="text-xs font-medium text-brand-subtle">On LokKart since {seller.memberSince}</div>
                  )}
                </div>
              </div>

              {/* Artisan Bio, Badges, and Action Grid */}
              <div className="flex-1 pt-2 lg:pt-6 flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between">
                
                {/* Left: Bio & Authenticity Badges */}
                <div className="flex-1 space-y-4">
                  {seller.bio && (
                    <p className="text-brand-primary text-sm sm:text-base leading-relaxed font-medium max-w-3xl">
                      &ldquo;{seller.bio}&rdquo;
                    </p>
                  )}
                  
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {seller.giTag && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 rounded-pill text-xs font-bold shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-brand-tertiary" />
                        <span>{seller.giTag}</span>
                      </div>
                    )}
                    {seller.odopId && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-brand-primary border border-brand-line rounded-pill text-xs font-bold shadow-xs">
                        <BadgeCheck className="w-4 h-4 text-amber-500" />
                        <span>ODOP Reg: {seller.odopId}</span>
                      </div>
                    )}
                    {seller.artisanCardNo && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-brand-primary border border-brand-line rounded-pill text-xs font-bold shadow-xs">
                        <Building2 className="w-4 h-4 text-brand-subtle" />
                        <span>Artisan Card: {seller.artisanCardNo}</span>
                      </div>
                    )}
                    {seller.hyperlocalRunner && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-pill text-xs font-bold shadow-xs">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>3-Hour Hyperlocal Delivery</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Direct Contact Actions */}
                <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0 self-start">
                  {seller.whatsapp && (
                    <Button asChild className="w-full h-[46px] rounded-button bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm justify-center gap-2 transition-transform active:scale-[0.98]">
                      <a href={`https://wa.me/${digitsOnly(seller.whatsapp)}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp Seller Direct
                      </a>
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {seller.phone && (
                      <Button asChild variant="outline" className="h-[42px] rounded-button border-brand-line text-brand-primary hover:bg-muted font-bold text-xs shadow-xs justify-center gap-1.5">
                        <a href={`tel:${digitsOnly(seller.phone)}`}>
                          <Phone className="h-3.5 w-3.5 text-brand-tertiary" />
                          Call Seller
                        </a>
                      </Button>
                    )}
                    {seller.email && (
                      <Button asChild variant="outline" className="h-[42px] rounded-button border-brand-line text-brand-primary hover:bg-muted font-bold text-xs shadow-xs justify-center gap-1.5">
                        <a href={`mailto:${seller.email}`}>
                          <Mail className="h-3.5 w-3.5 text-brand-tertiary" />
                          Email Seller
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Quick Stats */}
            <div className="grid grid-cols-3 md:hidden mt-6 border-t border-brand-line pt-4 text-center divide-x divide-brand-line">
              <div>
                <div className="flex items-center justify-center gap-1 text-base font-extrabold text-brand-primary">
                  {seller.rating || 4.9} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-brand-subtle font-bold mt-0.5">Rating</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-brand-primary font-stack">{seller.ordersCount || 342}+</div>
                <div className="text-[10px] uppercase tracking-wider text-brand-subtle font-bold mt-0.5">Orders</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-brand-primary font-stack">{products.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-brand-subtle font-bold mt-0.5">Listings</div>
              </div>
            </div>

          </div>
        </div>



        {/* ============= Products Filter Bar & Catalog ============= */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-line mb-6">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto pb-2 md:pb-0">
            <Button
              size="sm"
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 h-[38px] rounded-pill text-xs font-bold px-5 ${
                activeCategory === "all"
                  ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                  : "bg-card text-brand-subtle border-brand-line hover:text-brand-primary hover:bg-muted"
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              All Crafts ({products.length})
            </Button>
            {categoryBreakdown.map((c) => (
              <Button
                key={c.category}
                size="sm"
                variant={activeCategory === c.category ? "default" : "outline"}
                onClick={() => setActiveCategory(c.category)}
                className={`shrink-0 h-[38px] rounded-pill text-xs font-bold px-5 capitalize ${
                  activeCategory === c.category
                    ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                    : "bg-card text-brand-subtle border-brand-line hover:text-brand-primary hover:bg-muted"
                }`}
              >
                {c.category} ({c.count})
              </Button>
            ))}
          </div>

          <div className="w-full md:w-auto flex items-center shrink-0 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-[180px] appearance-none text-sm h-[38px] pl-4 pr-10 rounded-button bg-card border border-brand-line text-brand-primary font-bold focus:ring-2 focus:ring-brand-tertiary outline-none cursor-pointer shadow-sm hover:bg-muted"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-subtle pointer-events-none rotate-90" />
          </div>
        </div>

        {/* ============= Product Grid ============= */}
        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-muted rounded-card border border-brand-line px-6">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 text-brand-subtle shadow-sm border border-brand-line">
              <ShoppingBag className="h-8 w-8 text-brand-subtle" />
            </div>
            <h3 className="text-xl font-bold text-brand-primary">No listings found</h3>
            <p className="text-sm text-brand-subtle mt-2 max-w-sm leading-relaxed font-medium">
              This artisan hasn&apos;t added products in this specific category yet. Try selecting a different category.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setActiveCategory("all")}
              className="mt-6 rounded-button font-bold text-brand-primary border-brand-line hover:bg-card"
            >
              View All Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[24px]">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Gallery Image Modal / Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-card rounded-card overflow-hidden shadow-2xl border border-brand-line">
            <Button
              onClick={() => setSelectedImage(null)}
              variant="outline"
              size="icon"
              className="absolute top-3 right-3 z-10 rounded-full bg-card text-brand-primary hover:bg-muted border-brand-line"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="max-h-[80vh] flex items-center justify-center p-2 bg-black">
              <img src={selectedImage} alt="Craft gallery preview" className="max-h-[75vh] w-auto object-contain rounded-md" />
            </div>
            <div className="p-4 bg-card border-t border-brand-line flex items-center justify-between text-xs font-bold text-brand-subtle">
              <span>{seller.name} — Craft & Workshop Showcase</span>
              <Button size="sm" onClick={() => setSelectedImage(null)} className="h-[32px] px-4 rounded-button bg-brand-primary text-primary-foreground font-bold">Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
