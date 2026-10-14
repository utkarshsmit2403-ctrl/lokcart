"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/context/StoreContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  SearchX, 
  MapPin, 
  Check, 
  Store, 
  Truck, 
  Info, 
  ArrowLeft,
  ChevronRight,
  User,
  Loader2,
  Clock,
  CheckCircle2
} from "lucide-react";

// Robust timeline builder for any order status (handles database orders without static timeline array)
function getOrderTimeline(order) {
  if (order?.timeline && Array.isArray(order.timeline) && order.timeline.length > 0) {
    return order.timeline;
  }

  const createdTime = order?.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "Confirmed";

  const isDelivery = order?.fulfillmentMode !== "pickup";
  const status = (order?.status || "placed").toLowerCase();

  const isPreparingOrHigher = ["preparing", "processing", "ready_for_pickup", "out_for_delivery", "completed", "delivered"].includes(status);
  const isOutOrHigher = ["out_for_delivery", "completed", "delivered"].includes(status);
  const isCompleted = ["completed", "delivered"].includes(status);
  const isReadyForPickup = ["ready_for_pickup", "completed", "delivered"].includes(status);

  if (isDelivery) {
    return [
      {
        label: "Order Placed & Confirmed",
        timestamp: createdTime,
        done: true,
      },
      {
        label: "Artisan Preparing Craft Items",
        timestamp: isPreparingOrHigher ? "In Progress" : "Pending",
        done: isPreparingOrHigher,
      },
      {
        label: "Out for Hyperlocal Delivery",
        timestamp: isOutOrHigher ? "Active Dispatch" : "Expected in 2-3 hrs",
        done: isOutOrHigher,
      },
      {
        label: "Handover Completed (OTP Verified)",
        timestamp: isCompleted ? "Delivered" : "Security Code Required",
        done: isCompleted,
      },
    ];
  } else {
    return [
      {
        label: "Order Placed & Confirmed",
        timestamp: createdTime,
        done: true,
      },
      {
        label: "Artisan Preparing Craft Items",
        timestamp: isPreparingOrHigher ? "In Progress" : "Pending",
        done: isPreparingOrHigher,
      },
      {
        label: "Ready at Artisan Atelier for Pickup",
        timestamp: isReadyForPickup ? "Ready for Pickup" : "Pending",
        done: isReadyForPickup,
      },
      {
        label: "Order Collected (Handover Complete)",
        timestamp: isCompleted ? "Collected" : "Pending Pickup",
        done: isCompleted,
      },
    ];
  }
}

export default function OrderTrackingPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { orders } = useStore();
  
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find order in memory first
  const storeOrder = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return null;
    return orders.find((o) => o.id === id || String(o.id) === String(id));
  }, [orders, id]);

  // Live fetch from /api/orders?id=... (prioritize live MongoDB data with timeline)
  useEffect(() => {
    if (id) {
      setIsLoading(!storeOrder);
      fetch(`/api/orders?id=${encodeURIComponent(id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setFetchedOrder(data.order);
          }
        })
        .catch((err) => console.error("Error fetching order:", err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const order = fetchedOrder || storeOrder;
  const timeline = useMemo(() => (order ? getOrderTimeline(order) : []), [order]);

  // Loading state
  if (isLoading && !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <Loader2 size={36} className="animate-spin text-brand-tertiary" />
          <p className="text-sm font-bold text-brand-subtle mt-4">Retrieving order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // If there is no order found, render a friendly empty state
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[40px] flex flex-col items-center justify-center">
          <Card className="rounded-card border-brand-line bg-card shadow-sm p-[48px] text-center max-w-lg mx-auto flex flex-col items-center gap-6 mt-10">
            <div className="w-[80px] h-[80px] rounded-full bg-accent text-brand-tertiary flex items-center justify-center shadow-sm">
              <SearchX size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-brand-primary">Order Not Found</h2>
              <p className="text-sm text-brand-subtle leading-relaxed max-w-[320px] mx-auto font-medium">
                We couldn&apos;t find order #{id}. It may have been completed, or the ID is incorrect.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="rounded-button border-brand-line text-brand-primary font-bold h-[44px]">
                <Link href="/orders">View All Orders</Link>
              </Button>
              <Button asChild className="rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground h-[44px] font-bold shadow-sm">
                <Link href="/explore">Continue Exploring</Link>
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const orderIdStr = String(order.id || id || "");
  const orderShortId = orderIdStr.includes("-") ? orderIdStr.split("-")[0] : orderIdStr;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "Recent";

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal || order.total || 0;
  const fulfillmentFee = order.fulfillmentFee !== undefined 
    ? order.fulfillmentFee 
    : (order.fulfillmentMode === "pickup" ? 0 : 49);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[40px]">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-bold text-brand-subtle mb-[24px]">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/orders" className="hover:text-brand-tertiary transition-colors">Your Orders</Link>
          <ChevronRight size={14} />
          <span className="text-brand-primary uppercase">Order #{orderShortId}</span>
        </nav>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] mb-[32px]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-tertiary uppercase tracking-wider mb-1">
              <MapPin size={16} />
              Live Order Journey
            </div>
            <h1 className="text-xl md:text-[32px] font-bold text-brand-primary tracking-tight leading-tight">
              Order Tracking
            </h1>
            <p className="text-sm text-brand-subtle mt-1.5 font-medium">
              Order <span className="font-mono font-bold text-brand-primary uppercase">#{orderShortId}</span> • Placed on {orderDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-[32px] items-start">
          
          {/* Left: Interactive Timeline, Delivery Address & Fulfillment Details (7 Cols) */}
          <div className="md:col-span-7 space-y-[24px]">
            
            {/* Timeline Card */}
            <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm">
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-[24px] flex items-center justify-between">
                <span>Live Order Milestones</span>
                <Badge className="bg-brand-tertiary/10 hover:bg-brand-tertiary/10 text-brand-tertiary rounded-pill px-3 py-1 font-bold border border-brand-tertiary/20 text-xs">
                  {order.status === "ready_for_pickup"
                    ? "Ready at Atelier"
                    : order.status === "out_for_delivery"
                    ? "Runner on Way"
                    : order.status === "completed" || order.status === "delivered"
                    ? "Delivered"
                    : "Preparing Order"}
                </Badge>
              </h3>

              <div className="space-y-[24px] relative before:absolute before:inset-0 before:left-[14px] before:w-[2px] before:bg-brand-line before:h-full">
                {(timeline || []).map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-all ${
                        step.done
                          ? "bg-brand-primary text-primary-foreground ring-[4px] ring-muted shadow-sm"
                          : "bg-card border-2 border-brand-line text-brand-subtle"
                      }`}
                    >
                      {step.done ? (
                        <Check size={16} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold ${step.done ? "text-brand-primary" : "text-brand-subtle"}`}>
                          {step.label}
                        </h4>
                        <span className="text-xs text-brand-subtle font-medium">{step.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Address Card */}
            <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-brand-line pb-3 flex items-center gap-2">
                <User size={20} className="text-brand-tertiary" />
                Delivery Address
              </h3>
              
              <div className="space-y-2 pt-1">
                <p className="text-md font-bold text-brand-primary">
                  {order.customer?.name || "Customer"}
                </p>
                <p className="text-sm font-medium text-brand-subtle leading-relaxed max-w-[80%]">
                  {order.customer?.address || "Address details on file"}
                  {order.customer?.district ? `, ${order.customer.district}` : ""}
                  {order.customer?.state ? `, ${order.customer.state}` : ""}
                  {(order.customer?.pincode || order.customer?.pinCode) ? ` - ${order.customer.pincode || order.customer.pinCode}` : ""}
                </p>
                {order.customer?.phone && (
                  <div className="flex items-center gap-2 mt-3 pt-3">
                    <span className="text-sm font-medium text-brand-subtle">Phone number:</span>
                    <span className="text-sm font-bold text-brand-primary font-mono">{order.customer.phone}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Handover & Location Card */}
            <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
                Fulfillment Details &amp; Handover
              </h3>

              {order.fulfillmentMode === "pickup" ? (
                <div className="bg-muted p-[16px] rounded-lg border border-brand-line text-sm">
                  <div className="flex items-center gap-2 text-brand-primary font-bold mb-1.5">
                    <Store size={20} className="text-brand-tertiary" />
                    Artisan Workshop Address:
                  </div>
                  <p className="text-brand-subtle font-medium leading-relaxed mt-1">
                    {order.pickupLocation || `${order.customer?.district || "Local"} Master Atelier`}
                  </p>
                  <p className="text-xs text-brand-subtle mt-2.5 flex items-center gap-1.5 font-medium">
                    <Info size={16} className="shrink-0 text-brand-primary" />
                    Visiting hours: 10:00 AM – 7:30 PM (Mon–Sat). Call ahead if required.
                  </p>
                </div>
              ) : (
                <div className="bg-muted p-[16px] rounded-lg border border-brand-line text-sm">
                  <div className="flex items-center gap-2 text-brand-primary font-bold mb-1.5">
                    <Truck size={20} className="text-brand-tertiary" />
                    Assigned Delivery Runner:
                  </div>
                  <p className="text-brand-primary font-semibold mb-1">
                    {order.runnerName || "LokKart Local Express Runner"}
                  </p>
                  <p className="text-brand-subtle font-medium">
                    Destination: {order.customer?.address || "Delivery address"}, {order.customer?.district || "Local"}
                  </p>
                </div>
              )}

              {/* Handover OTP */}
              {order.otp && (
                <div className="p-[20px] bg-accent/30 rounded-card border border-brand-line text-center mt-[16px] relative overflow-hidden shadow-sm">
                  <div className="absolute left-0 top-0 w-1 h-full bg-brand-tertiary" />
                  <div className="text-xs font-bold uppercase text-brand-subtle tracking-widest mb-1">
                    Patron Verification OTP
                  </div>
                  <div className="text-[36px] font-mono font-extrabold text-brand-primary tracking-[0.2em] mb-1 leading-tight">
                    {order.otp}
                  </div>
                  <p className="text-xs text-brand-subtle leading-relaxed font-medium">
                    Provide this code to the maker or delivery runner to confirm handover.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right: Items in Order & Receipt (5 Cols) */}
          <div className="md:col-span-5 lg:sticky lg:top-[100px]">
            <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[24px]">
              <h3 className="text-md font-bold text-brand-primary pb-3 border-b border-brand-line">
                Order Items ({orderItems.length})
              </h3>

              <div className="space-y-[16px] max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-[16px] text-sm">
                    <img
                      src={item.image || "/logo.png"}
                      alt={item.name || "Craft Item"}
                      className="w-[64px] h-[64px] rounded-md object-cover border border-brand-line flex-shrink-0 bg-muted"
                      onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-brand-primary truncate">{item.name}</h4>
                      <p className="text-xs text-brand-subtle font-medium truncate">{item.sellerName || "Authentic Craft"}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-brand-subtle font-medium">Qty: {item.quantity}</span>
                        <span className="font-extrabold text-brand-primary">₹{(item.price || 0) * (item.quantity || 1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-[16px] border-t border-brand-line space-y-[12px] text-sm font-medium">
                <div className="flex justify-between text-brand-subtle">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-primary">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-subtle">
                  <span>Fulfillment Charge</span>
                  <span className="font-bold text-brand-primary">
                    {fulfillmentFee === 0 ? "Free (Pickup)" : `₹${fulfillmentFee}`}
                  </span>
                </div>
                <Separator className="my-2 bg-brand-line" />
                <div className="flex justify-between items-center text-md font-bold text-brand-primary pt-1">
                  <span>Total Paid</span>
                  <span className="text-brand-tertiary text-xl font-extrabold">₹{order.total}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full h-[48px] rounded-button bg-accent hover:bg-muted text-brand-primary font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] border border-brand-line shadow-sm"
                >
                  <Link href="/explore">
                    <ArrowLeft size={16} />
                    Continue Exploring Crafts
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}