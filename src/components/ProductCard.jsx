"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Truck, Star, Minus, Plus, Zap, ShoppingBag } from "lucide-react";

export default function ProductCard({ product, showDistance = true }) {
  const router = useRouter();
  const { cart, addToCart, updateCartQuantity, removeFromCart, userLocation } = useStore();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isUnder10km = product.distanceKm <= 10.0;

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1, isUnder10km ? "hyperlocal" : "pickup");
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (cartItem) {
      updateCartQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (cartItem.quantity > 1) {
      updateCartQuantity(product.id, cartItem.quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      tabIndex={0}
      role="button"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer gap-0 rounded-card border-brand-line bg-card py-0 shadow-sm transition-all duration-300 hover:border-brand-tertiary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-tertiary overflow-hidden flex flex-col h-full"
    >
      <CardContent className="flex flex-col flex-1 p-3 sm:p-4">
        <div className="flex-1 flex flex-col">
          {/* Media Box */}
          <div className="relative aspect-square w-full overflow-hidden rounded-md border border-brand-line bg-muted">
            <img
              src={product.images.primary}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Top badges: ODOP & Craft Cluster */}
            <div className="pointer-events-none absolute left-2 right-2 top-2 flex items-start justify-between gap-1">
              <Badge
                variant="outline"
                className="rounded-pill border-brand-line bg-card/95 px-2 py-0.5 text-[10px] font-bold text-brand-primary shadow-sm backdrop-blur-xs"
              >
                {product.odopBadge || "ODOP"}
              </Badge>
              <Badge className="rounded-pill bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm truncate max-w-[50%]">
                {product.district}
              </Badge>
            </div>

            {/* Bottom ETA badge */}
            <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between">
              {isUnder10km ? (
                <Badge className="flex items-center gap-1 rounded-pill bg-brand-tertiary px-2 py-0.5 text-[10px] font-bold text-tertiary-foreground shadow-sm">
                  <Zap className="h-4  w-4 fill-current" />
                  3-Hr
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 truncate rounded-pill border-brand-line bg-card/95 px-2 py-0.5 text-[10px] font-bold text-brand-primary shadow-sm"
                >
                  <Truck className="h-4  w-4 text-destructive" />
                  {product.distanceKm} km
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="flex items-center gap-1 rounded-pill bg-card/90 px-2 py-0.5 text-[10px] font-bold text-brand-primary shadow-sm"
              >
                <Star className="h-4  w-4 fill-brand-tertiary text-brand-tertiary" />
                {product.rating}
              </Badge>
            </div>
          </div>

          {/* Content Block */}
          <div className="pt-4 flex-1 flex flex-col">
            <div className="truncate text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
              {product.specs?.material || product.categoryLabel || `${product.district} Craft`}
            </div>

            <h3 className="line-clamp-2 text-sm sm:text-md font-bold leading-snug text-brand-primary transition-colors group-hover:text-brand-tertiary">
              {product.name}
            </h3>

            {product.sellerId ? (
              <Link
                href={`/brand/${product.sellerId}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 truncate text-xs font-medium text-brand-subtle hover:text-brand-tertiary hover:underline w-fit"
              >
                {product.sellerName}
              </Link>
            ) : (
              <p className="mt-1 truncate text-xs font-medium text-brand-subtle">
                {product.sellerName}
              </p>
            )}

            {showDistance && (
              <div className="mt-3 flex items-center justify-between gap-1 rounded-md border border-brand-line bg-muted px-2 py-1.5 text-xs text-brand-primary">
                <span className="flex items-center gap-1.5 truncate text-brand-subtle font-medium">
                  <MapPin className="h-4  w-4 text-brand-tertiary shrink-0" />
                  <span className="truncate">To: {userLocation?.city || "Address"}</span>
                </span>
                <span className="ml-1 whitespace-nowrap font-bold text-brand-primary">
                  {isUnder10km ? "Local" : `${product.distanceKm} km`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Quick-add stepper */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-line pt-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-md sm:text-lg font-extrabold text-brand-primary">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-brand-subtle line-through font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {product.discountPercent && (
              <span className="text-[10px] font-bold text-destructive">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          <div>
            {cartItem ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center border border-brand-line rounded-button overflow-hidden bg-muted h-[32px] sm:h-[36px]"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-full w-[32px] sm:w-[36px] rounded-none text-brand-primary hover:bg-brand-line transition-colors"
                  onClick={handleDecrement}
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 text-sm font-bold text-brand-primary min-w-[32px] sm:min-w-[36px] text-center bg-card h-full flex items-center justify-center border-x border-brand-line">
                  {cartItem.quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-full w-[32px] sm:w-[36px] rounded-none text-brand-primary hover:bg-brand-line transition-colors"
                  onClick={handleIncrement}
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleAdd}
                size="sm"
                variant="outline"
                className="flex h-[32px] sm:h-[36px] cursor-pointer items-center gap-1.5 rounded-button border border-brand-primary bg-card px-3 sm:px-4 text-xs font-bold text-brand-primary shadow-sm transition-all duration-150 hover:bg-brand-primary hover:text-primary-foreground active:scale-95"
                aria-label={`Add ${product.name} to bag`}
              >
                <span>ADD</span>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}