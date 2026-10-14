"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/context/StoreContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  ShoppingBag, 
  ChevronRight, 
  Truck, 
  Store, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Loader2
} from "lucide-react";

// Helper to determine status styling and icons
const getStatusConfig = (status, fulfillmentMode) => {
  const normStatus = (status || "placed").toLowerCase();
  switch (normStatus) {
    case "delivered":
    case "completed":
      return { 
        label: "Delivered", 
        icon: CheckCircle2, 
        classes: "bg-green-100 text-green-800 border-green-200" 
      };
    case "out_for_delivery":
      return { 
        label: "Out for Delivery", 
        icon: Truck, 
        classes: "bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20" 
      };
    case "ready_for_pickup":
      return { 
        label: "Ready at Atelier", 
        icon: Store, 
        classes: "bg-blue-100 text-blue-800 border-blue-200" 
      };
    case "processing":
    case "preparing":
      return { 
        label: "Preparing Order", 
        icon: Clock, 
        classes: "bg-amber-100 text-amber-800 border-amber-200" 
      };
    default:
      return { 
        label: "Order Placed", 
        icon: Package, 
        classes: "bg-muted text-brand-primary border-brand-line" 
      };
  }
};

export default function OrdersPage() {
  const { orders, refreshOrders, user } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync orders on mount and when active user changes
  useEffect(() => {
    if (refreshOrders) {
      refreshOrders(user?.phone);
    }
  }, [user?.phone, refreshOrders]);

  const handleManualRefresh = async () => {
    if (!refreshOrders) return;
    setIsRefreshing(true);
    await refreshOrders(user?.phone);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Sort orders so the newest ones appear at the top
  const sortedOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return [...orders].sort((a, b) => {
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [orders]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[40px]">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-bold text-brand-subtle mb-[24px]">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-primary">Your Orders</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-[32px]">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-bold text-brand-primary tracking-tight leading-tight">
              Order History
            </h1>
            <p className="text-sm font-medium text-brand-subtle mt-1">
              Track, manage, and view details for all your authentic craft purchases.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {sortedOrders.length > 0 && (
              <Badge variant="outline" className="bg-muted text-brand-primary border-brand-line px-3 py-1 text-xs font-bold rounded-pill">
                {sortedOrders.length} Total Orders
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-[36px] rounded-button border-brand-line text-brand-subtle hover:text-brand-primary font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-brand-tertiary" : ""} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {sortedOrders.length === 0 ? (
          /* Empty State */
          <Card className="rounded-card border-brand-line bg-card shadow-sm p-[48px] text-center max-w-lg mx-auto flex flex-col items-center gap-[24px] mt-[40px]">
            <div className="w-[80px] h-[80px] rounded-full bg-muted text-brand-subtle flex items-center justify-center shadow-sm border border-brand-line">
              <Package size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-brand-primary">No orders found</h2>
              <p className="text-sm text-brand-subtle leading-relaxed font-medium max-w-[320px] mx-auto">
                You haven&apos;t placed any orders yet. Discover authentic local crafts and bring home a piece of heritage today.
              </p>
            </div>
            <Button asChild className="rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground px-[24px] h-[48px] font-bold mt-2 shadow-sm transition-transform active:scale-[0.98]">
              <Link href="/explore">Start Exploring</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-[24px]">
            {sortedOrders.map((order) => {
              const orderIdStr = String(order?.id || "");
              const shortId = orderIdStr.includes("-") ? orderIdStr.split("-")[0] : orderIdStr;
              const statusConfig = getStatusConfig(order?.status, order?.fulfillmentMode);
              const StatusIcon = statusConfig.icon;
              
              const items = Array.isArray(order?.items) ? order.items : [];
              const primaryItem = items[0] || null;
              const remainingItemsCount = Math.max(0, items.length - 1);
              const totalAmount = order?.total || order?.subtotal || 0;

              return (
                <Card 
                  key={orderIdStr || Math.random()} 
                  className="rounded-card border-brand-line bg-card shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="bg-muted/50 p-[16px] md:p-[20px] border-b border-brand-line flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
                    <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[12px] text-sm">
                      <div>
                        <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider mb-0.5">Order Placed</p>
                        <p className="font-bold text-brand-primary">
                          {order?.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recent"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider mb-0.5">Total Amount</p>
                        <p className="font-bold text-brand-primary">₹{totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider mb-0.5">Order ID</p>
                        <p className="font-mono font-bold text-brand-primary uppercase">#{shortId}</p>
                      </div>
                    </div>
                    
                    <Badge className={`px-3 py-1 rounded-pill text-xs font-bold border shadow-none flex items-center gap-1.5 w-max ${statusConfig.classes}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Order Body / Items */}
                  <div className="p-[16px] md:p-[24px] flex flex-col md:flex-row gap-[24px] justify-between items-start md:items-center">
                    
                    {/* Items Preview */}
                    <div className="flex items-center gap-[16px] flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={primaryItem?.image || "/logo.png"} 
                          alt={primaryItem?.name || "Craft Item"} 
                          onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                          className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-md object-cover border border-brand-line shadow-sm bg-muted"
                        />
                        {remainingItemsCount > 0 && (
                          <div className="absolute -bottom-2 -right-2 bg-brand-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-card shadow-sm">
                            +{remainingItemsCount} more
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="text-md font-bold text-brand-primary line-clamp-2 leading-snug">
                          {primaryItem?.name || "Authentic Craft Heritage Item"}
                          {remainingItemsCount > 0 && (
                            <span className="text-brand-subtle font-medium ml-1">
                              and {remainingItemsCount} other item{remainingItemsCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs font-medium text-brand-subtle mt-1.5 flex items-center gap-1.5">
                          <Store size={14} />
                          {primaryItem?.sellerName || "Artisan Guild Partner"}
                        </p>
                        
                        {/* Fulfillment Info */}
                        <div className="mt-3 flex items-center gap-1.5">
                          <Badge variant="outline" className="bg-muted text-brand-primary border-brand-line text-[10px] font-bold rounded-sm px-2">
                            {order?.fulfillmentMode === "pickup" ? "Self-Pickup" : order?.fulfillmentMode === "hyperlocal" ? "3-Hr Runner" : "Standard Delivery"}
                          </Badge>
                          {order?.customer?.district && (
                            <span className="text-xs text-brand-subtle font-medium">
                              • {order.customer.district}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-auto flex flex-col gap-[12px] shrink-0">
                      <Button 
                        asChild 
                        className="w-full md:w-auto h-[44px] px-[24px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-sm transition-transform active:scale-[0.98]"
                      >
                        <Link href={`/orders/${orderIdStr}`}>
                          Track Order
                          <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </Button>
                      
                      {primaryItem?.productId ? (
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full md:w-auto h-[44px] px-[24px] rounded-button bg-card hover:bg-muted text-brand-primary border-brand-line font-bold text-sm shadow-sm transition-transform active:scale-[0.98]"
                        >
                          <Link href={`/products/${primaryItem.productId}`}>
                            Buy Again
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full md:w-auto h-[44px] px-[24px] rounded-button bg-card hover:bg-muted text-brand-primary border-brand-line font-bold text-sm shadow-sm transition-transform active:scale-[0.98]"
                        >
                          <Link href="/explore">
                            Explore Similar
                          </Link>
                        </Button>
                      )}
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}