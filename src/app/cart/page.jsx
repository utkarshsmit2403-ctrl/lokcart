"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { HYPERLOCAL_MAX_KM } from "@/lib/constants";

const FALLBACK_FULFILLMENT = {
  pickup: { fee: 0, label: "Self-Pickup", time: "Ready shortly" },
  hyperlocal: { fee: 49, label: "3-Hr Local", time: "3 hours" },
  global: { fee: 99, label: "Standard", time: "2-4 days" },
};

function getFulfillmentInfo(product, mode) {
  const fromProduct = product?.fulfillmentOptions?.[mode];
  const fallback = FALLBACK_FULFILLMENT[mode];
  return {
    available: fromProduct?.available ?? true,
    fee: fromProduct?.fee ?? fallback.fee,
    time: fromProduct?.time ?? fallback.time,
  };
}

function getUnitPrice(item) {
  const { product, selectedOptionId } = item;
  const option = product?.variants?.options?.find((o) => o.id === selectedOptionId);
  return product.price + (option?.priceDelta || 0);
}

export default function CartPage() {
  const {
    cart,
    userLocation,
    removeFromCart,
    updateCartQuantity,
    updateCartFulfillment,
  } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + getUnitPrice(item) * item.quantity, 0);
  const fulfillmentFeeTotal = cart.reduce((sum, item) => {
    const { fee } = getFulfillmentInfo(item.product, item.fulfillmentMode);
    return sum + fee;
  }, 0);
  const total = subtotal + fulfillmentFeeTotal;
  const itemCount = cart.reduce((a, b) => a + b.quantity, 0);
  const hasLocation = Boolean(userLocation && userLocation.city);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[40px]">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-semibold text-brand-subtle mb-6">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px] text-brand-line">chevron_right</span>
          <Link href="/explore" className="hover:text-brand-tertiary transition-colors">Craft Catalog</Link>
          <span className="material-symbols-outlined text-[16px] text-brand-line">chevron_right</span>
          <span className="text-brand-primary font-bold">Your Bag</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-[28px] text-brand-tertiary">shopping_bag</span>
          <h1 className="text-xl md:text-2xl font-bold text-brand-primary tracking-tight">
            Your Artisan Bag <span className="text-brand-subtle font-medium text-lg">({itemCount} items)</span>
          </h1>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <Card className="rounded-card border-brand-line bg-card shadow-sm p-[48px] text-center max-w-lg mx-auto flex flex-col items-center gap-6 mt-10">
            <div className="w-[80px] h-[80px] rounded-full bg-accent text-brand-tertiary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[40px]">shopping_basket</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-brand-primary">Your bag is empty</h2>
              <p className="text-sm text-brand-subtle leading-relaxed max-w-[320px] mx-auto">
                Discover authentic local craftings and bring home a piece of heritage today.
              </p>
            </div>
            <Button asChild className="rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground px-[24px] py-[12px] h-auto mt-2">
              <Link href="/explore">Browse ODOP Crafts</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] items-start">
            
            {/* Items List (Left Column) */}
            <div className="lg:col-span-7 space-y-[24px]">
              
              {!hasLocation && (
                <div className="flex items-start gap-3 bg-accent/50 border border-brand-line text-brand-primary rounded-card p-4 text-sm shadow-sm">
                  <span className="material-symbols-outlined text-[20px] text-brand-tertiary mt-0.5">location_on</span>
                  <p className="leading-relaxed">
                    Set your delivery location to see accurate hyperlocal 3-hour availability for each item.
                  </p>
                </div>
              )}

              <div className="space-y-[16px]">
                {cart.map((item) => {
                  const { product, quantity, fulfillmentMode, selectedColorId, selectedOptionId } = item;
                  const unitPrice = getUnitPrice(item);
                  const selectedColor = product.variants?.colors?.find((c) => c.id === selectedColorId);
                  const selectedOption = product.variants?.options?.find((o) => o.id === selectedOptionId);

                  const distanceKm = product.distanceKm;
                  const hyperlocalAllowed =
                    hasLocation &&
                    getFulfillmentInfo(product, "hyperlocal").available &&
                    (typeof distanceKm !== "number" || distanceKm <= HYPERLOCAL_MAX_KM);

                  const availableModes = ["pickup", "hyperlocal", "global"].filter((mode) => {
                    if (mode === "hyperlocal") return hyperlocalAllowed;
                    return getFulfillmentInfo(product, mode).available;
                  });

                  const effectiveMode = availableModes.includes(fulfillmentMode) ? fulfillmentMode : "pickup";

                  return (
                    <Card
                      key={`${product.id}-${selectedColorId || "nc"}-${selectedOptionId || "no"}`}
                      className="rounded-card border-brand-line bg-card shadow-sm p-[20px] flex flex-col gap-[20px] transition-shadow hover:shadow-md"
                    >
                      {/* Product Info Section */}
                      <div className="flex gap-[16px]">
                        <img
                          src={product.images.primary}
                          alt={product.name}
                          className="w-[100px] h-[100px] rounded-md object-cover border border-brand-line flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-xs text-brand-subtle uppercase font-semibold mb-1">
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-brand-tertiary text-brand-tertiary rounded-pill bg-brand-tertiary/5">
                              {product.odopBadge || "ODOP"}
                            </Badge>
                            <span>•</span>
                            <span>{product.district}</span>
                            {typeof distanceKm === "number" && (
                              <>
                                <span>•</span>
                                <span className="normal-case text-brand-tertiary">{distanceKm} km away</span>
                              </>
                            )}
                          </div>
                          
                          <h4 className="text-md font-bold text-brand-primary truncate">{product.name}</h4>
                          <p className="text-sm text-brand-subtle truncate mt-0.5">{product.sellerName}</p>

                          {(selectedColor || selectedOption) && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {selectedColor && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary bg-muted border border-brand-line rounded-pill pl-1.5 pr-2.5 py-1">
                                  <span
                                    className="w-3 h-3 rounded-full border border-brand-line shadow-sm"
                                    style={{ backgroundColor: selectedColor.swatch }}
                                  />
                                  {selectedColor.label}
                                </span>
                              )}
                              {selectedOption && (
                                <span className="text-xs font-semibold text-brand-primary bg-muted border border-brand-line rounded-pill px-2.5 py-1">
                                  {selectedOption.label}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-baseline gap-2 mt-3">
                            <span className="text-lg font-extrabold text-brand-primary">₹{unitPrice * quantity}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-brand-subtle line-through">
                                ₹{product.originalPrice * quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment Selection Box */}
                      <div className="bg-muted p-[16px] rounded-lg border border-brand-line/60">
                        <div className="text-sm font-semibold text-brand-primary mb-3">Delivery Mode</div>
                        <RadioGroup
                          value={effectiveMode}
                          onValueChange={(mode) => updateCartFulfillment(product.id, mode)}
                          className="grid grid-cols-3 gap-3"
                        >
                          {["pickup", "hyperlocal", "global"].map((mode) => {
                            const isAvailable = availableModes.includes(mode);
                            const info = getFulfillmentInfo(product, mode);
                            const isActive = effectiveMode === mode;
                            return (
                              <label
                                key={mode}
                                htmlFor={`${product.id}-${mode}`}
                                className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-md border text-center transition-all ${
                                  !isAvailable
                                    ? "bg-muted text-brand-subtle border-brand-line cursor-not-allowed opacity-60"
                                    : isActive
                                    ? "bg-brand-tertiary text-tertiary-foreground border-brand-tertiary shadow-sm cursor-pointer"
                                    : "bg-card text-brand-primary border-brand-line hover:border-brand-tertiary cursor-pointer hover:shadow-sm"
                                }`}
                              >
                                <RadioGroupItem
                                  value={mode}
                                  id={`${product.id}-${mode}`}
                                  disabled={!isAvailable}
                                  className="sr-only"
                                />
                                <span className="text-sm font-semibold leading-tight">
                                  {FALLBACK_FULFILLMENT[mode].label}
                                </span>
                                <span className={`text-xs ${isActive ? "text-tertiary-foreground/80" : "text-brand-subtle"}`}>
                                  {!isAvailable ? "Unavailable" : info.fee === 0 ? "Free" : `₹${info.fee}`}
                                </span>
                              </label>
                            );
                          })}
                        </RadioGroup>
                        {!hyperlocalAllowed && (
                          <p className="text-xs text-destructive mt-3 flex items-start gap-1">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            <span>
                              {!hasLocation
                                ? "Set your delivery location to unlock hyperlocal 3-hour delivery."
                                : `Outside the ${HYPERLOCAL_MAX_KM} km zone (${distanceKm} km away) — select standard or pickup.`}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between pt-[16px] border-t border-brand-line">
                        <div className="flex items-center border border-brand-line rounded-button overflow-hidden bg-muted">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-[36px] w-[36px] rounded-none text-brand-primary hover:bg-brand-line transition-colors"
                            onClick={() => updateCartQuantity(product.id, Math.max(1, quantity - 1))}
                          >
                            −
                          </Button>
                          <span className="px-4 text-sm font-bold text-brand-primary min-w-[40px] text-center bg-card h-[36px] flex items-center justify-center border-x border-brand-line">
                            {quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-[36px] w-[36px] rounded-none text-brand-primary hover:bg-brand-line transition-colors"
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          className="text-sm text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1.5 font-semibold h-[36px] px-3 rounded-button transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Remove
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Order Summary (Right Column) */}
            <div className="lg:col-span-5 lg:sticky lg:top-[100px]">
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-[24px] space-y-[24px]">
                <div className="flex items-center justify-between pb-4 border-b border-brand-line">
                  <h3 className="text-lg font-bold text-brand-primary">Order Summary</h3>
                  <Link href="/explore" className="text-sm text-brand-tertiary font-bold hover:underline">
                    + Add More
                  </Link>
                </div>

                <div className="space-y-[16px] text-sm">
                  <div className="flex justify-between text-brand-subtle">
                    <span>Makers Subtotal ({itemCount} items)</span>
                    <span className="font-semibold text-brand-primary">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-brand-subtle">
                    <span>Fulfillment Fees</span>
                    <span className="font-semibold text-brand-primary">
                      {fulfillmentFeeTotal === 0 ? "Free" : `₹${fulfillmentFeeTotal}`}
                    </span>
                  </div>
                  
                  <Separator className="bg-brand-line my-4" />
                  
                  <div className="flex justify-between items-center text-md text-brand-primary pt-2">
                    <span className="font-bold">Total Payable</span>
                    <span className="text-xl font-extrabold text-brand-tertiary">₹{total}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block w-full pt-2">
                  <Button className="w-full h-[52px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-semibold text-md shadow-sm transition-transform active:scale-[0.98]">
                    <span>Proceed to Checkout</span>
                    <span className="material-symbols-outlined text-[20px] ml-2">arrow_forward</span>
                  </Button>
                </Link>

                <div className="bg-accent/40 rounded-lg p-3 mt-4 border border-brand-line">
                  <p className="text-xs text-center text-brand-primary font-medium flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-brand-tertiary">verified</span>
                    100% Direct-to-Maker Payment Protection
                  </p>
                </div>
              </Card>
            </div>
            
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}