"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

function titleCaseKey(key) {
  const spaced = String(key).replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).trim();
}

function digitsOnly(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

/* ----------------------------------------------------------------------- */
/*  FULLSCREEN IMAGE VIEWER — swipe / arrow-key / thumbnail slider         */
/* ----------------------------------------------------------------------- */
function FullscreenViewer({ images, index, onIndexChange, onClose }) {
  const touchStartX = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onIndexChange, onClose]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) onIndexChange((index - 1 + images.length) % images.length);
    else if (delta < -50) onIndexChange((index + 1) % images.length);
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-brand-primary/95 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-primary-foreground/90 shrink-0">
        <span className="text-sm font-bold tabular-nums">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Image stage */}
      <div className="relative flex-1 flex items-center justify-center px-4 select-none">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
            aria-label="Previous image"
            className="hidden sm:flex absolute left-3 md:left-6 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>
        )}

        <img
          src={images[index]?.src}
          alt={images[index]?.label}
          className="max-h-[75vh] max-w-full object-contain"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % images.length)}
            aria-label="Next image"
            className="hidden sm:flex absolute right-3 md:right-6 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        )}
      </div>

      {/* Thumbnail slider */}
      {images.length > 1 && (
        <div className="shrink-0 flex items-center gap-3 overflow-x-auto px-4 py-6">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                i === index ? "border-brand-tertiary opacity-100" : "border-white/20 opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const {
    products,
    sellers,
    userLocation,
    setIsDistrictModalOpen,
    addToCart,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  const product = products.find((p) => p.id === id) || products[0];
  const cartItem = cart?.find((item) => item.product.id === product.id);

  const seller =
    sellers && sellers.length > 0
      ? sellers.find(
          (s) =>
            s.id === product?.sellerId ||
            s.name?.toLowerCase().includes(product?.sellerName?.toLowerCase()) ||
            s.district?.toLowerCase() === product?.district?.toLowerCase()
        ) || sellers[0]
      : null;

  const distance = typeof product?.distanceKm === "number" ? product.distanceKm : 15;
  const isNear = distance <= 10.0;

  // Wherever the storefront used to send patrons off to a generic district
  // search, send them straight to this maker's own seller page instead.
  const sellerHref = seller?.id
    ? `/brand/${seller.id}`
    : `/explore?district=${product?.district || ""}`;

  // "You Might Also Like" — other pieces from the same craft category,
  // falling back to trending picks so the shelf never looks empty.
  const relatedProducts = (() => {
    if (!product || !products?.length) return [];
    const sameCategory = products.filter((p) => p.id !== product.id && p.category === product.category);
    const pool = sameCategory.length > 0 ? sameCategory : products.filter((p) => p.id !== product.id && p.trending);
    return pool.slice(0, 8);
  })();

  // Gallery state
  const [selectedImage, setSelectedImage] = useState(product?.images?.primary || "");
  const [activeThumb, setActiveThumb] = useState("primary");

  // Fullscreen viewer state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Horizontal carousel refs — Reviews & "You Might Also Like"
  const reviewsCarouselRef = useRef(null);
  const relatedCarouselRef = useRef(null);
  const scrollCarousel = (ref, direction) => {
    const node = ref?.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.85 * direction, behavior: "smooth" });
  };

  // Update selected image when product loads
  React.useEffect(() => {
    if (product?.images?.primary) {
      setSelectedImage(product.images.primary);
    }
  }, [product?.id]);

  // Selected fulfillment mode: "hyperlocal" if near, otherwise "global"
  const [chosenFulfillment, setChosenFulfillment] = useState(() => {
    return isNear ? "hyperlocal" : "global";
  });

  // Variant selection state
  const [selectedColorId, setSelectedColorId] = useState(product?.variants?.defaultColorId || null);
  const [selectedOptionId, setSelectedOptionId] = useState(product?.variants?.defaultOptionId || null);

  // Reset variant + fulfillment selection whenever the underlying product changes
  React.useEffect(() => {
    setSelectedColorId(product?.variants?.defaultColorId || null);
    setSelectedOptionId(product?.variants?.defaultOptionId || null);
    setChosenFulfillment(isNear ? "hyperlocal" : "global");
  }, [product?.id]);

  const selectedColor = product?.variants?.colors?.find((c) => c.id === selectedColorId);
  const selectedOption = product?.variants?.options?.find((o) => o.id === selectedOptionId);
  const variantPriceDelta = selectedOption?.priceDelta || 0;
  const effectivePrice = (product?.price || 0) + variantPriceDelta;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1, chosenFulfillment, { selectedColorId, selectedOptionId });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 1, chosenFulfillment, {
        selectedColorId,
        selectedOptionId,
        openCart: false,
      });
    }
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const handleUpdateQty = (nextQty) => {
    if (!product) return;
    if (nextQty <= 0) {
      removeFromCart(product.id);
    } else {
      updateCartQuantity(product.id, nextQty);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand-primary">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <span className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
            <p className="text-sm font-bold text-brand-primary">Loading artisan product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const thumbnails = [
    { id: "primary", label: "Front View", src: product.images.primary },
    ...(product.images.drape ? [{ id: "drape", label: "Full Drape", src: product.images.drape }] : []),
    ...(product.images.pallu ? [{ id: "pallu", label: "Pallu Detail", src: product.images.pallu }] : []),
    ...(product.images.artisan ? [{ id: "artisan", label: "Atelier Loom", src: product.images.artisan }] : []),
    ...(product.images.cert ? [{ id: "cert", label: "GI Certificate", src: product.images.cert }] : []),
  ];

  const activeThumbIndex = Math.max(
    0,
    thumbnails.findIndex((t) => t.id === activeThumb)
  );

  const handleLightboxIndexChange = (nextIndex) => {
    const next = thumbnails[nextIndex];
    if (next) {
      setSelectedImage(next.src);
      setActiveThumb(next.id);
    }
  };

  const sellerPhone = seller?.phone;
  const sellerWhatsapp = seller?.whatsapp || seller?.phone;
  const sellerEmail = seller?.email;
  const whatsappMessage = encodeURIComponent(
    `Hi ${product.sellerName}, I'm interested in "${product.name}" (₹${effectivePrice}) that I saw on LokKart. Is it available?`
  );

  const highlights = product.highlights || [];
  const faqs = product.faqs || [];
  const careInstructions = product.careInstructions || [
    "Handle with care — this is an individually handcrafted item and may show minor natural variation.",
    "Store away from direct sunlight and excess moisture to preserve colours and finish.",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-[40px]">
        {/* Provenance Breadcrumbs Hierarchy */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-brand-subtle mb-[24px] overflow-x-auto whitespace-nowrap pb-1 custom-scrollbar"
        >
          <Link href="/" className="hover:text-brand-tertiary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[14px] text-brand-line">chevron_right</span>
          <span className="hover:text-brand-tertiary">{product.state}</span>
          <span className="material-symbols-outlined text-[14px] text-brand-line">chevron_right</span>
          <Link
            href={sellerHref}
            className="hover:text-brand-tertiary text-brand-primary font-bold"
          >
            {product.district}
          </Link>
          <span className="material-symbols-outlined text-[14px] text-brand-line">chevron_right</span>
          <span className="text-brand-subtle">{product.categoryLabel}</span>
          <span className="material-symbols-outlined text-[14px] text-brand-line">chevron_right</span>
          <span className="text-brand-subtle font-medium">Item #{product.id.toUpperCase()}</span>
        </nav>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] lg:gap-[48px] items-start mb-[48px]">
          
          {/* LEFT COLUMN: Gallery & Official Seals (7 Cols - Sticky Gallery) */}
          <div className="lg:col-span-7 flex flex-col gap-[24px] lg:sticky lg:top-[100px] self-start w-full">
            
            {/* Main Image Frame + Left Thumbnail Rail */}
            <div className="flex items-start gap-[16px] w-full">
              
              {/* Vertical thumbnail rail */}
              {thumbnails.length > 1 && (
                <div className="hidden sm:flex flex-col gap-[12px] w-[80px] shrink-0">
                  {thumbnails.map((thumb) => (
                    <button
                      key={thumb.id}
                      onClick={() => {
                        setSelectedImage(thumb.src);
                        setActiveThumb(thumb.id);
                      }}
                      className={`aspect-square rounded-md overflow-hidden border-2 relative transition-all cursor-pointer ${
                        activeThumb === thumb.id
                          ? "border-brand-tertiary shadow-sm"
                          : "border-brand-line hover:border-brand-primary opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={thumb.src} alt={thumb.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Stage */}
              <div className="relative flex-1 min-w-0 w-full aspect-square bg-muted rounded-card overflow-hidden border border-brand-line shadow-sm group">
                {/* Geospatial / Origin Badges */}
                <div className="absolute top-[16px] left-[16px] z-10 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-bold bg-card/95 text-brand-primary border border-brand-line shadow-sm backdrop-blur-xs">
                    <span
                      className="material-symbols-outlined text-[16px] text-brand-tertiary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    {product.odopBadge || "ODOP CERTIFIED"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill text-xs font-bold bg-brand-primary text-primary-foreground shadow-sm">
                    {product.giTag || "GI REGISTRY"}
                  </span>
                </div>

                {/* Main Image */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute inset-0 w-full h-full cursor-zoom-in bg-muted/10 flex items-center justify-center"
                  aria-label="Open fullscreen image viewer"
                >
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>

                {/* Prev / next arrows */}
                {thumbnails.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleLightboxIndexChange((activeThumbIndex - 1 + thumbnails.length) % thumbnails.length)
                      }
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-card/90 border border-brand-line opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm text-brand-primary hover:bg-card"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLightboxIndexChange((activeThumbIndex + 1) % thumbnails.length)}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-card/90 border border-brand-line opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm text-brand-primary hover:bg-card"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-[16px] right-[16px] bg-card/90 px-3 py-1.5 rounded-pill border border-brand-line flex items-center gap-1.5 text-brand-primary text-xs font-bold shadow-sm cursor-pointer hover:bg-card transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                  100% Handcrafted Detail
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery — shown below on mobile only */}
            <div className="grid grid-cols-4 sm:hidden gap-[12px] w-full">
              {thumbnails.map((thumb) => (
                <button
                  key={thumb.id}
                  onClick={() => {
                    setSelectedImage(thumb.src);
                    setActiveThumb(thumb.id);
                  }}
                  className={`aspect-square rounded-md overflow-hidden border-2 relative transition-all cursor-pointer ${
                    activeThumb === thumb.id
                      ? "border-brand-tertiary shadow-sm scale-[0.98]"
                      : "border-brand-line hover:border-brand-primary opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={thumb.src} alt={thumb.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 py-1 bg-brand-primary/80 text-primary-foreground text-[10px] font-bold text-center truncate px-1">
                    {thumb.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Official Trust Seals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px] p-[16px] bg-card rounded-card border border-brand-line shadow-sm w-full">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[24px] text-brand-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <div>
                  <p className="text-xs font-bold text-brand-primary leading-tight">ODOP Certified</p>
                  <p className="text-[10px] text-brand-subtle">{product.district} District</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[24px] text-brand-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  policy
                </span>
                <div>
                  <p className="text-xs font-bold text-brand-primary leading-tight">{product.giTag}</p>
                  <p className="text-[10px] text-brand-subtle">Legal Origin Lock</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[24px] text-brand-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <div>
                  <p className="text-xs font-bold text-brand-primary leading-tight">Handloom Mark</p>
                  <p className="text-[10px] text-brand-subtle">Ministry Verified</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[24px] text-brand-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
                <div>
                  <p className="text-xs font-bold text-brand-primary leading-tight">100% Authentic</p>
                  <p className="text-[10px] text-brand-subtle">Direct Artisan Lot</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Metadata, Fulfillment Matrix & Direct Checkout (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-[24px]">
            
            {/* Title & Guild Badge */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-brand-tertiary/10 hover:bg-brand-tertiary/10 text-brand-tertiary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill border border-brand-tertiary/20">
                  Limited Guild Batch #14
                </Badge>
                <span className="text-xs font-bold text-brand-subtle flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.stock <= 5 ? "bg-destructive animate-pulse" : "bg-brand-primary"
                    }`}
                  ></span>
                  {product.stock} items left in atelier
                </span>
              </div>

              <h1 className="text-2xl sm:text-[32px] sm:leading-[36px] font-bold text-brand-primary tracking-tight mb-2">
                {product.name}
              </h1>

              <p className="text-sm text-brand-subtle leading-relaxed font-medium">{product.description}</p>
            </div>

            {/* Compact Artisan & Seller Credential Badge */}
            <Card className="p-[16px] rounded-card border-brand-line bg-card shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-[12px] min-w-0">
                <Avatar className="w-[44px] h-[44px] border-2 border-brand-primary shrink-0">
                  <AvatarImage
                    src={seller?.avatar || product.images?.artisan || product.images?.primary}
                    alt={product.artisanName}
                  />
                  <AvatarFallback>{product.artisanName?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-brand-primary truncate">{product.artisanName}</p>
                    <span
                      className="material-symbols-outlined text-brand-tertiary text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-subtle font-medium truncate">
                    {product.sellerName} • {product.district}, {product.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
            
                <Link
                  href={sellerHref}
                  className="text-xs font-bold text-brand-tertiary hover:underline whitespace-nowrap flex items-center gap-0.5 ml-1"
                >
                  <span>Seller Page</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </Card>

            {/* Social Proof Bar */}
            <div className="flex items-center justify-between py-[12px] border-y border-brand-line text-sm">
              <div className="flex items-center gap-2">
                <span className="flex items-center text-brand-primary font-bold gap-1">
                  <span className="material-symbols-outlined text-[20px] text-brand-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {product.rating}
                </span>
                <span className="text-brand-subtle underline cursor-pointer hover:text-brand-primary transition-colors">
                  ({product.reviewsCount} verified patron reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-brand-primary bg-muted px-3 py-1 rounded-pill border border-brand-line shadow-sm">
                <span className="material-symbols-outlined text-[16px]">local_mall</span>
                {product.fulfilledCount} fulfilled
              </div>
            </div>

            {/* Price Panel & Direct Maker Note */}
            <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-extrabold text-brand-primary">₹{effectivePrice}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-md text-brand-subtle line-through font-medium">
                      ₹{product.originalPrice + variantPriceDelta}
                    </span>
                    <Badge className="bg-destructive/10 text-destructive text-[10px] font-bold border border-destructive/20 px-2 rounded-pill hover:bg-destructive/10">
                      {product.discountPercent}% Direct Maker Saving
                    </Badge>
                  </>
                )}
              </div>
              {variantPriceDelta !== 0 && (
                <p className="text-xs text-brand-subtle mt-1.5 font-medium">
                  Base price ₹{product.price} + ₹{variantPriceDelta} for {selectedOption?.label}
                </p>
              )}
              <p className="text-xs text-brand-subtle mt-[12px] flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-brand-tertiary">info</span>
                Incl. of all taxes • Direct Maker Price • Zero middleman markup
              </p>
            </Card>

            {/* Variant Selectors: Colour / Finish + Size / Pack / Blouse Option */}
            {(product.variants?.colors?.length > 0 || product.variants?.options?.length > 0) && (
              <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[24px]">
                <div className="flex items-center justify-between gap-2 pb-[4px] border-b border-brand-line">
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-brand-tertiary">tune</span>
                    Customise Your Piece
                  </h3>
                  <span className="text-[11px] font-bold text-brand-subtle truncate max-w-[55%] text-right">
                    {[selectedColor?.label, selectedOption?.label].filter(Boolean).join(" · ")}
                  </span>
                </div>

                {product.variants?.colors?.length > 0 && (
                  <div className="space-y-[12px]">
                    <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                      {product.variants.colorLabel || "Colour"}
                    </h3>
                    <RadioGroup
                      value={selectedColorId || ""}
                      onValueChange={setSelectedColorId}
                      className="grid grid-cols-3 sm:grid-cols-5 gap-[14px]"
                    >
                      {product.variants.colors.map((color) => {
                        const isActive = selectedColorId === color.id;
                        return (
                          <label
                            key={color.id}
                            htmlFor={`color-${color.id}`}
                            className="flex flex-col items-center gap-[6px] cursor-pointer group"
                          >
                            <RadioGroupItem value={color.id} id={`color-${color.id}`} className="sr-only" />
                            <span className="relative block">
                              <span
                                className={`block w-[40px] h-[40px] rounded-full border-2 transition-all ${
                                  isActive
                                    ? "border-brand-primary ring-2 ring-brand-primary/30 scale-105 shadow-sm"
                                    : "border-brand-line group-hover:border-brand-primary"
                                }`}
                                style={{ backgroundColor: color.swatch }}
                              />
                              {isActive && (
                                <span className="absolute -bottom-1 -right-1 w-[16px] h-[16px] rounded-full bg-brand-primary border-2 border-card flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[10px] text-primary-foreground leading-none">
                                    check
                                  </span>
                                </span>
                              )}
                            </span>
                            <span
                              className={`text-[10px] font-bold text-center leading-tight ${
                                isActive ? "text-brand-primary" : "text-brand-subtle"
                              }`}
                            >
                              {color.label}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}

                {product.variants?.options?.length > 0 && (
                  <div className="space-y-[12px]">
                    <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                      {product.variants.optionLabel || "Option"}
                    </h3>
                    <RadioGroup
                      value={selectedOptionId || ""}
                      onValueChange={setSelectedOptionId}
                      className="grid grid-cols-1 gap-[10px]"
                    >
                      {product.variants.options.map((option) => {
                        const isActive = selectedOptionId === option.id;
                        return (
                          <label
                            key={option.id}
                            htmlFor={`option-${option.id}`}
                            className={`flex items-center justify-between gap-3 py-[12px] px-[14px] rounded-card border text-sm font-bold cursor-pointer transition-all ${
                              isActive
                                ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                                : "bg-card text-brand-primary border-brand-line hover:border-brand-primary hover:bg-muted"
                            }`}
                          >
                            <span className="flex items-center gap-[10px] min-w-0">
                              <RadioGroupItem value={option.id} id={`option-${option.id}`} className="sr-only" />
                              <span
                                className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isActive ? "border-primary-foreground" : "border-brand-line"
                                }`}
                              >
                                {isActive && <span className="w-[8px] h-[8px] rounded-full bg-primary-foreground" />}
                              </span>
                              <span className="truncate">{option.label}</span>
                            </span>
                            {option.priceDelta !== 0 && (
                              <span
                                className={`shrink-0 ${isActive ? "text-primary-foreground/80" : "text-brand-subtle"}`}
                              >
                                {option.priceDelta > 0 ? `+₹${option.priceDelta}` : `-₹${Math.abs(option.priceDelta)}`}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}
              </Card>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
                <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-brand-tertiary">auto_awesome</span>
                  Highlights
                </h3>
                <ul className="space-y-[8px]">
                  {highlights.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-brand-subtle leading-relaxed font-medium">
                      <span className="material-symbols-outlined text-[18px] text-brand-primary mt-0.5 shrink-0">
                        check_circle
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* DUAL-LOCATION ROUTE BREAKDOWN (Origin vs Delivery Destination) */}
            <Card className="p-[20px] rounded-card bg-card border border-brand-line shadow-sm space-y-[16px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-brand-tertiary tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">route</span>
                  Direct-from-Maker Shipping Route
                </span>
                <Badge className="bg-muted text-brand-primary text-[10px] font-bold rounded-pill px-2 py-0.5 border border-brand-line">
                  Origin Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                {/* 1. Craft Origin */}
                <div className="p-[16px] rounded-card bg-muted border border-brand-line">
                  <div className="text-[10px] font-bold uppercase text-brand-subtle tracking-wider flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[14px] text-brand-primary">storefront</span>
                    1. Origin Atelier
                  </div>
                  <div className="text-sm font-bold text-brand-primary mt-1">
                    {product.district}, {product.state}
                  </div>
                  <div className="text-xs text-brand-subtle mt-1 font-medium">
                    {product.sellerName} • {product.artisanName}
                  </div>
                </div>

                {/* 2. Customer Delivery Destination */}
                <div className="p-[16px] rounded-card bg-brand-tertiary/5 border border-brand-tertiary/20">
                  <div className="text-[10px] font-bold uppercase text-brand-subtle tracking-wider flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-brand-tertiary">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      2. Delivery Destination
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDistrictModalOpen(true)}
                      className="text-brand-tertiary font-bold hover:underline cursor-pointer text-[10px]"
                    >
                      Change
                    </button>
                  </div>
                  <div className="text-sm font-bold text-brand-primary mt-1 truncate">
                    {userLocation ? `${userLocation.city}, ${userLocation.state}` : "New Delhi, Delhi"}
                  </div>
                  <div className="text-xs text-brand-subtle mt-1 font-medium flex items-center gap-1">
                    PIN: <span className="font-mono font-bold text-brand-primary">{userLocation?.pincode || "110001"}</span> •{" "}
                    {distance} km away
                  </div>
                </div>
              </div>

              <div className="text-xs text-brand-subtle font-medium leading-relaxed pt-[12px] border-t border-brand-line flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-brand-primary shrink-0 mt-0.5">info</span>
                <span>
                  {isNear
                    ? `Artisan atelier is only ${distance} km from your doorstep — eligible for ⚡ 3-Hour Local Runner Delivery!`
                    : `Dispatched directly from the master weaver atelier in ${product.district} to your address in ${
                        userLocation?.city || "New Delhi"
                      } (${distance} km) via insured express courier.`}
                </span>
              </div>
            </Card>

            {/* Choose How You Receive It */}
            <div className="space-y-[16px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-brand-tertiary">local_shipping</span>
                  Choose Delivery Mode
                </h3>
                <span className="text-[10px] font-bold uppercase text-brand-subtle tracking-wider">
                  {isNear ? "⚡ Hyperlocal Minutes Active" : "📦 Standard Delivery Active"}
                </span>
              </div>

              {/* Location Check Banner */}
              {!userLocation && (
                <div className="p-[16px] bg-muted border border-brand-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 text-brand-primary font-bold">
                    <span className="material-symbols-outlined text-[20px] text-brand-tertiary">near_me</span>
                    <span>Set your location to check instant 3-hour delivery to your doorstep.</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsDistrictModalOpen(true)}
                    className="h-[36px] px-[16px] rounded-button bg-brand-primary text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex-shrink-0"
                  >
                    Set Location
                  </Button>
                </div>
              )}

              {/* Radio Group of Cards */}
              <RadioGroup value={chosenFulfillment} onValueChange={setChosenFulfillment} className="space-y-[12px]">
                {/* 1. HYPERLOCAL 3-HOUR DELIVERY */}
                {isNear ? (
                  <label
                    htmlFor="fulfillment-hyperlocal"
                    className={`flex items-start gap-4 p-[16px] rounded-card border-2 cursor-pointer transition-all ${
                      chosenFulfillment === "hyperlocal"
                        ? "bg-brand-tertiary/5 border-brand-tertiary shadow-sm"
                        : "bg-card border-brand-line hover:border-brand-primary hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value="hyperlocal" id="fulfillment-hyperlocal" className="mt-1 w-4 h-4 text-brand-tertiary border-brand-line focus:ring-brand-tertiary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-primary">⚡ Hyperlocal 3-Hour Delivery</span>
                          <Badge className="bg-brand-tertiary/10 text-brand-tertiary text-[9px] font-bold flex items-center gap-1 rounded-pill px-2 py-0.5 border border-brand-tertiary/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-tertiary animate-pulse"></span>
                            Quick Runner
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-brand-primary">₹49</span>
                      </div>
                      <p className="text-xs text-brand-subtle font-medium mt-1">
                        Delivered by LokKart Local Runner within <span className="font-bold text-brand-primary">3 hours</span> •
                        Atelier is only <strong className="text-brand-tertiary">{distance} km</strong> away!
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-start gap-4 p-[16px] rounded-card border border-brand-line bg-muted opacity-70">
                    <span className="material-symbols-outlined text-[20px] text-brand-subtle mt-0.5">block</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-brand-subtle">Hyperlocal 3-Hour Delivery</span>
                        <Badge variant="outline" className="bg-card text-brand-subtle text-[10px] font-bold rounded-pill border-brand-line">
                          Unavailable (Too Far: {distance} km)
                        </Badge>
                      </div>
                      <p className="text-xs text-brand-subtle font-medium mt-1">
                        Only available within 5–10 km of {product.district}. Standard express courier will deliver to your city.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. STANDARD PAN-INDIA & GLOBAL DISPATCH */}
                <label
                  htmlFor="fulfillment-global"
                  className={`flex items-start gap-4 p-[16px] rounded-card border-2 cursor-pointer transition-all ${
                    chosenFulfillment === "global"
                      ? "bg-brand-tertiary/5 border-brand-tertiary shadow-sm"
                      : "bg-card border-brand-line hover:border-brand-primary hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value="global" id="fulfillment-global" className="mt-1 w-4 h-4 text-brand-tertiary border-brand-line focus:ring-brand-tertiary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-primary">Pan-India &amp; Standard Dispatch</span>
                        {!isNear && (
                          <Badge className="bg-muted text-brand-primary border border-brand-line text-[10px] font-bold rounded-pill">
                            Standard Courier
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-bold text-brand-primary">₹99</span>
                    </div>
                    <p className="text-xs text-brand-subtle font-medium mt-1">
                      Insured express courier delivery (2–4 business days) to {userLocation?.city || "your address"}.
                    </p>
                  </div>
                </label>

                {/* 3. SELF-PICKUP FROM ATELIER */}
                <label
                  htmlFor="fulfillment-pickup"
                  className={`flex items-start gap-4 p-[16px] rounded-card border-2 cursor-pointer transition-all ${
                    chosenFulfillment === "pickup"
                      ? "bg-brand-tertiary/5 border-brand-tertiary shadow-sm"
                      : "bg-card border-brand-line hover:border-brand-primary hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value="pickup" id="fulfillment-pickup" className="mt-1 w-4 h-4 text-brand-tertiary border-brand-line focus:ring-brand-tertiary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-primary">Self-Pickup from Atelier</span>
                        <Badge className="bg-muted text-brand-primary border border-brand-line text-[10px] font-bold rounded-pill">
                          Zero Waste
                        </Badge>
                      </div>
                      <span className="text-sm font-bold text-brand-primary">Free</span>
                    </div>
                    <p className="text-xs text-brand-subtle font-medium mt-1">
                      Ready for pickup in <span className="font-bold text-brand-primary">2 hours</span> • Atelier at{" "}
                      {product.sellerName} ({distance} km away)
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Action Buttons: Stepper & Quick Checkout */}
            <div className="space-y-[16px] pt-[12px]">
              {cartItem ? (
                <div className="flex flex-col sm:flex-row items-center gap-[16px]">
                  <div className="flex items-center justify-between border border-brand-line bg-muted rounded-button h-[52px] w-full sm:w-1/2 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(cartItem.quantity - 1)}
                      className="w-[52px] h-full flex items-center justify-center hover:bg-brand-line cursor-pointer transition-colors text-brand-primary"
                      aria-label="Decrease quantity"
                    >
                      <span className="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <div className="flex items-center gap-2 flex-1 justify-center bg-card h-full border-x border-brand-line">
                      <span className="text-xs uppercase text-brand-subtle font-bold tracking-wider">In Bag:</span>
                      <span className="font-mono text-lg font-bold text-brand-primary">{cartItem.quantity}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(cartItem.quantity + 1)}
                      className="w-[52px] h-full flex items-center justify-center hover:bg-brand-line cursor-pointer transition-colors text-brand-primary"
                      aria-label="Increase quantity"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="h-[52px] w-full sm:w-1/2 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-md shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Bag</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-[16px]">
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    variant="outline"
                    className="w-full sm:w-1/2 h-[52px] rounded-button bg-card border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-primary-foreground font-bold text-md transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    <span>Add to Bag • ₹{effectivePrice}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full sm:w-1/2 h-[52px] rounded-button bg-secondary hover:bg-secondary-hover text-primary-foreground font-bold text-md transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    <span>Instant Checkout</span>
                  </Button>
                </div>
              )}

              {/* Buy Directly From Seller */}
              {(sellerPhone || sellerEmail) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-[48px] rounded-button border border-brand-line bg-muted text-brand-primary hover:border-brand-primary font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[20px]">storefront</span>
                      Buy Directly from Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-card border-brand-line">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-brand-primary">
                        <Avatar className="w-[48px] h-[48px] border-2 border-brand-primary shadow-sm">
                          <AvatarImage src={seller?.avatar} alt={product.sellerName} />
                          <AvatarFallback>{product.sellerName?.charAt(0) || "S"}</AvatarFallback>
                        </Avatar>
                        <span>{product.sellerName}</span>
                      </DialogTitle>
                      <DialogDescription className="text-brand-subtle font-medium leading-relaxed">
                        Skip the cart and order this piece straight from the artisan — call, message on WhatsApp, or
                        email to confirm availability and arrange payment directly.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-[12px] text-sm mt-[16px]">
                      {sellerPhone && (
                        <div className="flex items-center justify-between p-[16px] rounded-card border border-brand-line bg-muted">
                          <div className="flex items-center gap-2 text-brand-primary font-bold">
                            <span className="material-symbols-outlined text-[20px] text-brand-primary">call</span>
                            {sellerPhone}
                          </div>
                          <Button asChild size="sm" className="h-[36px] px-[16px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold">
                            <a href={`tel:${digitsOnly(sellerPhone)}`}>Call</a>
                          </Button>
                        </div>
                      )}
                      {sellerWhatsapp && (
                        <div className="flex items-center justify-between p-[16px] rounded-card border border-brand-line bg-muted">
                          <div className="flex items-center gap-2 text-brand-primary font-bold">
                            <span className="material-symbols-outlined text-[20px] text-brand-tertiary">chat</span>
                            WhatsApp
                          </div>
                          <Button asChild size="sm" className="h-[36px] px-[16px] rounded-button bg-card border border-brand-line hover:border-brand-primary text-brand-primary font-bold">
                            <a
                              href={`https://wa.me/${digitsOnly(sellerWhatsapp)}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Message
                            </a>
                          </Button>
                        </div>
                      )}
                      {sellerEmail && (
                        <div className="flex items-center justify-between p-[16px] rounded-card border border-brand-line bg-muted">
                          <div className="flex items-center gap-2 text-brand-primary font-bold truncate pr-4">
                            <span className="material-symbols-outlined text-[20px] text-brand-primary shrink-0">mail</span>
                            <span className="truncate">{sellerEmail}</span>
                          </div>
                          <Button asChild size="sm" variant="outline" className="h-[36px] px-[16px] rounded-button border-brand-line hover:bg-card shrink-0 font-bold">
                            <a href={`mailto:${sellerEmail}?subject=${encodeURIComponent(`Inquiry: ${product.name}`)}`}>
                              Email
                            </a>
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-brand-subtle font-medium pt-[12px]">
                        {seller?.address || `${product.district} Craft Cluster, ${product.state}`}
                      </p>
                    </div>

                    <DialogFooter className="mt-[16px]">
                      <p className="text-[11px] text-brand-subtle font-medium leading-relaxed bg-accent/30 p-[12px] rounded-md border border-brand-line w-full">
                        <strong className="text-brand-primary">Disclaimer:</strong> Buying directly means the platform's order tracking &amp; buyer protection won't apply — agree
                        on price and delivery with the seller before paying.
                      </p>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Description / Specifications / Care / FAQs */}
            <Tabs defaultValue="overview" className="bg-card rounded-card border border-brand-line shadow-sm overflow-hidden">
              <TabsList className="w-full grid grid-cols-4 rounded-none bg-muted h-auto p-0 border-b border-brand-line">
                <TabsTrigger value="overview" className="text-xs font-bold py-[12px] data-[state=active]:bg-card data-[state=active]:text-brand-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="specs" className="text-xs font-bold py-[12px] data-[state=active]:bg-card data-[state=active]:text-brand-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none">
                  Specs
                </TabsTrigger>
                <TabsTrigger value="care" className="text-xs font-bold py-[12px] data-[state=active]:bg-card data-[state=active]:text-brand-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none">
                  Care
                </TabsTrigger>
                <TabsTrigger value="faqs" className="text-xs font-bold py-[12px] data-[state=active]:bg-card data-[state=active]:text-brand-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none">
                  FAQs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-[24px] text-sm text-brand-subtle leading-relaxed font-medium m-0">
                {product.detailedDescription || product.description}
              </TabsContent>

              <TabsContent value="specs" className="p-[24px] m-0">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] text-sm">
                  {Object.entries(product.specs || {}).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-brand-subtle text-[10px] uppercase font-bold tracking-wide">{titleCaseKey(key)}</dt>
                      <dd className="font-bold text-brand-primary mt-1">{value}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>

              <TabsContent value="care" className="p-[24px] m-0">
                <ul className="space-y-[12px]">
                  {careInstructions.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-brand-subtle leading-relaxed font-medium">
                      <span className="material-symbols-outlined text-[18px] text-brand-primary mt-0.5 shrink-0">spa</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="faqs" className="p-[16px] m-0">
                {faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`} className="border-brand-line">
                        <AccordionTrigger className="text-sm font-bold text-brand-primary text-left px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-brand-subtle font-medium leading-relaxed px-2 pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-brand-subtle font-medium p-[8px]">No FAQs added for this product yet.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

    <section className="mt-[64px] pt-[48px] border-t border-brand-line">
    
          {/* Compact Style Information Grid */}
          <div className="flex w-full">
   
              <Card className="bg-card border border-brand-line rounded-card p-[24px] shadow-sm w-full">
                <h3 className="text-sm font-bold text-brand-subtle uppercase tracking-wider border-b border-brand-line pb-4 mb-4">
                  Seller Details
                </h3>
                <div className="text-sm font-medium text-brand-primary space-y-4 leading-relaxed">
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-brand-subtle w-[160px] shrink-0">Seller Name:</span> 
                    <span className="font-bold">{seller?.legalEntityName || product.sellerName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-brand-subtle w-[160px] shrink-0">Registration / ODOP:</span> 
                    <span className="font-bold">{seller?.registrationNumber || seller?.odopId || "Pending Allotment"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-brand-subtle w-[160px] shrink-0">GI / Quality Cert:</span> 
                    <span className="font-bold">{product.giTag || "GI Registry Pending"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-brand-subtle w-[160px] shrink-0">Address:</span> 
                    <span className="font-bold">
                      {seller?.address
                        ? `${seller.address}${seller?.pincode ? `, ${seller.pincode}` : ""}`
                        : `${product.district} Craft Cluster, ${product.state}`}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-brand-subtle w-[160px] shrink-0">Customer Care:</span> 
                    <span className="font-bold">{sellerEmail || "support@lokkart.in"}</span>
                  </div>
                </div>

              
              </Card>
       

         

          </div>
        </section>
        {/* ================= PATRON REVIEWS ================= */}
        <section className="mt-[64px] pt-[48px] border-t border-brand-line">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[24px] mb-[32px]">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-brand-tertiary uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  reviews
                </span>
                Patron Feedback
              </div>
              <h2 className="text-[28px] md:text-[36px] leading-[1.1] font-bold text-brand-primary tracking-tight">
                Ratings &amp; Reviews
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
            {/* Rating Summary */}
            <div className="lg:col-span-4">
              <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm h-full">
                <div className="flex items-center gap-3">
                  <span className="text-[44px] font-bold text-brand-primary leading-none">{product.rating}</span>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`material-symbols-outlined text-[18px] ${
                            n <= Math.round(product.rating) ? "text-brand-tertiary" : "text-brand-line"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-brand-subtle font-bold mt-1">
                      {product.reviewsCount} verified patron reviews
                    </p>
                  </div>
                </div>

                <div className="mt-[20px] space-y-[8px]">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-[10px] font-bold text-brand-subtle">{star}</span>
                      <div className="flex-1 h-[6px] rounded-pill bg-muted overflow-hidden">
                        <div
                          className="h-full bg-brand-tertiary rounded-pill"
                          style={{ width: `${product.ratingBreakdown?.[star] || 0}%` }}
                        />
                      </div>
                      <span className="w-[32px] text-right font-bold text-brand-subtle">
                        {product.ratingBreakdown?.[star] || 0}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-[20px] pt-[16px] border-t border-brand-line flex items-center gap-2 text-xs text-brand-subtle font-medium leading-relaxed">
                  <span className="material-symbols-outlined text-[16px] text-brand-primary shrink-0">verified_user</span>
                  <span>All reviews are from patrons with a verified purchase on LokKart.</span>
                </div>
              </Card>
            </div>

            {/* Individual Reviews — horizontal carousel */}
            <div className="lg:col-span-8 relative">
              <div
                ref={reviewsCarouselRef}
                className="flex gap-[16px] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 custom-scrollbar"
              >
                {(product.reviews || []).map((review) => (
                  <Card
                    key={review.id}
                    className="snap-start shrink-0 w-[260px] sm:w-[300px] p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[10px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-[32px] h-[32px] border border-brand-line shrink-0">
                          <AvatarFallback className="text-xs font-bold bg-muted text-brand-primary">
                            {review.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-primary truncate">{review.name}</p>
                          <p className="text-[10px] text-brand-subtle font-medium truncate">{review.city}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-subtle font-bold whitespace-nowrap">{review.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`material-symbols-outlined text-[14px] ${
                            n <= review.rating ? "text-brand-tertiary" : "text-brand-line"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                      {review.verifiedPurchase && (
                        <span className="ml-1.5 text-[10px] font-bold text-brand-primary bg-muted px-[8px] py-[2px] rounded-pill border border-brand-line">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-brand-primary">{review.title}</p>
                    <p className="text-sm text-brand-subtle leading-relaxed font-medium">{review.body}</p>

                    <div className="flex items-center gap-1.5 text-[11px] text-brand-subtle font-bold pt-[4px]">
                      <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                      Helpful ({review.helpfulCount})
                    </div>
                  </Card>
                ))}
              </div>

              {(product.reviews?.length || 0) > 1 && (
                <div className="hidden sm:flex items-center gap-2 justify-end mt-[12px]">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(reviewsCarouselRef, -1)}
                    aria-label="Scroll reviews left"
                    className="w-[36px] h-[36px] rounded-full border border-brand-line bg-card hover:bg-muted flex items-center justify-center text-brand-primary shadow-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(reviewsCarouselRef, 1)}
                    aria-label="Scroll reviews right"
                    className="w-[36px] h-[36px] rounded-full border border-brand-line bg-card hover:bg-muted flex items-center justify-center text-brand-primary shadow-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= YOU MIGHT ALSO LIKE ================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-[64px] pt-[48px] border-t border-brand-line">
            <div className="flex items-end justify-between gap-[24px] mb-[24px]">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-tertiary uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    grid_view
                  </span>
                  From the Same Craft Cluster
                </div>
                <h2 className="text-[28px] md:text-[36px] leading-[1.1] font-bold text-brand-primary tracking-tight">
                  You Might Also Like
                </h2>
              </div>
              <Link
                href={`/category/${product.category}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-brand-tertiary hover:underline whitespace-nowrap"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="relative">
              <div
                ref={relatedCarouselRef}
                className="flex gap-[16px] lg:gap-[20px] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 custom-scrollbar"
              >
                {relatedProducts.map((rp) => (
                  <div key={rp.id} className="snap-start shrink-0 w-[200px] sm:w-[230px] lg:w-[250px]">
                    <ProductCard product={rp} />
                  </div>
                ))}
              </div>

              {relatedProducts.length > 3 && (
                <div className="hidden sm:flex items-center gap-2 justify-end mt-[12px]">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(relatedCarouselRef, -1)}
                    aria-label="Scroll products left"
                    className="w-[36px] h-[36px] rounded-full border border-brand-line bg-card hover:bg-muted flex items-center justify-center text-brand-primary shadow-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(relatedCarouselRef, 1)}
                    aria-label="Scroll products right"
                    className="w-[36px] h-[36px] rounded-full border border-brand-line bg-card hover:bg-muted flex items-center justify-center text-brand-primary shadow-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}   
        {/* Right: Other Information & Story */}
            <div className="flex mt-[36px]">
              
              {/* Other Information Block */}
              <Card className="bg-card border border-brand-line rounded-card p-[24px] shadow-sm">
                <h3 className="text-sm font-bold text-brand-subtle uppercase tracking-wider border-b border-brand-line pb-4 mb-4">
                  Other Information
                </h3>
                <div className="text-xs font-medium text-brand-subtle leading-relaxed text-justify space-y-4">
                  <p>
                    <strong className="text-brand-primary">Country Of Origin:</strong> India.
                  </p>
                  <p>
                    The image(s) shown are representative of the actual product. While every effort has been made to maintain accurate up to date product related content, slight variations in texture, color, and pattern are natural hallmarks of authentic handcrafted items.
                  </p>
                  <p>
                    It is recommended to read product labels, batch and packing details before use. For additional info, please contact the seller directly.
                  </p>
                </div>
              </Card>
            </div>

      </main>

      {/* Fixed Bottom Action Bar — mobile & tablet only; desktop uses the inline buttons above */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-brand-line shadow-[0_-8px_24px_rgba(0,0,0,0.06)] p-[16px] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-[16px]">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-brand-subtle font-bold uppercase tracking-wider leading-none mb-1">Total</p>
            <p className="text-xl font-bold text-brand-primary leading-tight">₹{effectivePrice}</p>
          </div>

          {cartItem ? (
            <div className="flex items-center gap-[12px] flex-1">
              <div className="flex items-center justify-between border border-brand-line bg-muted rounded-button h-[48px] px-2 font-bold text-sm flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateQty(cartItem.quantity - 1)}
                  className="w-[36px] h-[36px] text-brand-primary hover:bg-brand-line rounded-md"
                  aria-label="Decrease quantity"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </Button>
                <span className="font-mono text-md font-bold text-brand-primary">{cartItem.quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateQty(cartItem.quantity + 1)}
                  className="w-[36px] h-[36px] text-brand-primary hover:bg-brand-line rounded-md"
                  aria-label="Increase quantity"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </Button>
              </div>
              <Button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="h-[48px] px-[20px] rounded-button bg-brand-primary text-primary-foreground font-bold text-sm shadow-sm flex-shrink-0 active:scale-[0.98]"
              >
                View Bag
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-[12px] flex-1">
              <Button
                type="button"
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 h-[48px] rounded-button border-2 border-brand-primary text-brand-primary bg-card font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                Add
              </Button>
              <Button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-[48px] rounded-button bg-secondary text-primary-foreground font-bold text-sm shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Buy
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLightboxOpen && (
        <FullscreenViewer
          images={thumbnails}
          index={activeThumbIndex}
          onIndexChange={handleLightboxIndexChange}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}