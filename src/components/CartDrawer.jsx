"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ShieldCheck, X } from "lucide-react";

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

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
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

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-card border-l border-brand-line text-brand-primary flex flex-col p-0 gap-0 shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-4 md:p-6 border-b border-brand-line bg-card flex flex-row items-center justify-between shrink-0">
          <SheetTitle className="text-xl font-bold text-brand-primary flex items-center gap-2">
            <ShoppingBag className=" text-brand-tertiary" />
            Your Bag ({cart?.length || 0})
          </SheetTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCartOpen(false)} 
            className="rounded-full hover:bg-muted m-0"
          >
            <X className=" text-brand-primary" />
          </Button>
        </SheetHeader>

        {/* Cart Item List */}
        <ScrollArea className="flex-1 ">
          <div className="py-[24px] space-y-[16px]">
            {cart.length === 0 ? (
              <div className="text-center py-[64px] px-4">
                <div className="w-[80px] h-[80px] rounded-full bg-muted flex items-center justify-center mx-auto text-brand-subtle mb-[24px] border border-brand-line shadow-sm">
                  <ShoppingBag className="h-8 w-8 text-brand-tertiary" />
                </div>
                <h4 className="text-lg font-bold text-brand-primary">Your bag is empty</h4>
                <p className="text-sm font-medium text-brand-subtle mt-2 max-w-[260px] mx-auto leading-relaxed">
                  Explore authentic Madhubani handlooms, Gorakhpur terracotta, or organic Makhana.
                </p>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-[32px] px-[24px] h-[48px] rounded-button bg-brand-primary text-primary-foreground text-sm font-bold shadow-sm transition-transform active:scale-[0.98]"
                >
                  Browse ODOP Crafts
                </Button>
              </div>
            ) : (
              cart.map((item) => {
                const { product, quantity, fulfillmentMode, selectedColorId, selectedOptionId } = item;
                const unitPrice = getUnitPrice(item);
                const selectedColor = product.variants?.colors?.find((c) => c.id === selectedColorId);
                const selectedOption = product.variants?.options?.find((o) => o.id === selectedOptionId);
                const availableModes = ["pickup", "hyperlocal", "global"].filter(
                  (mode) => getFulfillmentInfo(product, mode).available
                );

                return (
                  <div
                    key={`${product.id}-${selectedColorId || "nc"}-${selectedOptionId || "no"}`}
                    className="bg-card rounded-card p-[16px] border border-brand-line shadow-sm flex flex-col gap-[16px]"
                  >
                    <div className="flex gap-[16px]">
                      <img
                        src={product.images.primary}
                        alt={product.name}
                        className="w-[80px] h-[80px] rounded-md object-cover border border-brand-line flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-tertiary uppercase mb-1">
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-brand-tertiary/40 text-brand-tertiary rounded-pill">
                            {product.odopBadge || "ODOP"}
                          </Badge>
                          <span className="text-brand-line">•</span>
                          <span className="truncate">{product.district}</span>
                        </div>
                        <h4 className="text-sm font-bold text-brand-primary truncate leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-xs font-medium text-brand-subtle truncate mt-0.5">{product.sellerName}</p>

                        {/* Selected variant chips */}
                        {(selectedColor || selectedOption) && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {selectedColor && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-primary bg-muted border border-brand-line rounded-pill pl-1.5 pr-2.5 py-0.5 shadow-xs">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-brand-line"
                                  style={{ backgroundColor: selectedColor.swatch }}
                                />
                                {selectedColor.label}
                              </span>
                            )}
                            {selectedOption && (
                              <span className="text-[10px] font-bold text-brand-primary bg-muted border border-brand-line rounded-pill px-2.5 py-0.5 shadow-xs">
                                {selectedOption.label}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-md font-extrabold text-brand-primary">
                            ₹{unitPrice * quantity}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs font-medium text-brand-subtle line-through">
                              ₹{product.originalPrice * quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fulfillment choice per item */}
                    <div className="bg-muted p-[16px] rounded-lg border border-brand-line">
                      <div className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider mb-2">
                        Delivery Mode
                      </div>
                      <RadioGroup
                        value={fulfillmentMode}
                        onValueChange={(mode) => updateCartFulfillment(product.id, mode)}
                        className="grid grid-cols-3 gap-2"
                      >
                        {availableModes.map((mode) => {
                          const info = getFulfillmentInfo(product, mode);
                          const isActive = fulfillmentMode === mode;
                          return (
                            <label
                              key={mode}
                              htmlFor={`${product.id}-${mode}`}
                              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md border text-center cursor-pointer transition-all ${
                                isActive
                                  ? "bg-brand-tertiary text-tertiary-foreground border-brand-tertiary shadow-sm"
                                  : "bg-card text-brand-primary border-brand-line hover:border-brand-primary"
                              }`}
                            >
                              <RadioGroupItem
                                value={mode}
                                id={`${product.id}-${mode}`}
                                className="sr-only"
                              />
                              <span className="text-xs font-bold leading-tight">
                                {FALLBACK_FULFILLMENT[mode].label}
                              </span>
                              <span className={`text-[10px] font-medium ${isActive ? "text-tertiary-foreground/80" : "text-brand-subtle"}`}>
                                {info.fee === 0 ? "Free" : `₹${info.fee}`}
                              </span>
                            </label>
                          );
                        })}
                      </RadioGroup>
                      <p className="text-[10px] font-medium text-brand-subtle mt-2 flex justify-end">
                        ETA: <strong className="ml-1 text-brand-primary">{getFulfillmentInfo(product, fulfillmentMode).time}</strong>
                      </p>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex items-center justify-between pt-[16px] border-t border-brand-line">
                      <div className="flex items-center border border-brand-line bg-muted rounded-button overflow-hidden h-[36px]">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-full w-[36px] rounded-none text-brand-primary hover:bg-brand-line"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 text-sm font-bold text-brand-primary bg-card border-x border-brand-line h-full flex items-center justify-center min-w-[40px]">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-full w-[36px] rounded-none text-brand-primary hover:bg-brand-line"
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1.5 h-[36px] px-3 rounded-button transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer with Summary & Checkout */}
        {cart.length > 0 && (
          <SheetFooter className="p-[24px] bg-card border-t border-brand-line space-y-[16px] sm:flex-col shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
            <div className="w-full space-y-2 text-sm font-medium">
              <div className="flex justify-between text-brand-subtle">
                <span>Makers Subtotal</span>
                <span className="font-bold text-brand-primary">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-brand-subtle">
                <span>Fulfillment Fees</span>
                <span className="font-bold text-brand-primary">
                  {fulfillmentFeeTotal === 0 ? "Free" : `₹${fulfillmentFeeTotal}`}
                </span>
              </div>
              <Separator className="my-2 bg-brand-line" />
              <div className="flex justify-between text-md font-bold text-brand-primary pt-1 items-center">
                <span>Total Payable</span>
                <span className="text-xl font-extrabold text-brand-tertiary">₹{total}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full">
              <Button className="w-full h-[52px] rounded-button bg-brand-primary text-primary-foreground font-bold text-md shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <div className="bg-muted p-2 rounded-md border border-brand-line">
              <p className="text-[11px] font-bold text-brand-subtle flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-tertiary" />
                100% Direct-to-Maker Payment Protection
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}