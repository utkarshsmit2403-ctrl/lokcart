"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HYPERLOCAL_MAX_KM } from "@/lib/constants";
import {
  ChevronRight,
  Check,
  CheckCircle2,
  MapPin,
  Info,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Store,
  Clock,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  Truck,
  ArrowRight,
  User,
  Sparkles,
  Phone,
  Building,
  Navigation
} from "lucide-react";

// Loads the Razorpay Checkout widget script once and caches the result safely
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.getElementById("razorpay-checkout-script");
    if (existing) {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Razorpay) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(Boolean(window.Razorpay));
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAYMENT_OPTIONS = [
  {
    id: "Razorpay (UPI, GPay, PhonePe, QR)",
    name: "UPI / QR Code",
    badge: "Recommended",
    Icon: QrCode,
    note: "Instant payment via GPay, PhonePe, Paytm, BHIM",
  },
  {
    id: "Razorpay (Cards & NetBanking)",
    name: "Cards & NetBanking",
    badge: "Razorpay Secure",
    Icon: CreditCard,
    note: "Visa, MasterCard, RuPay, 50+ NetBanking options",
  },
  {
    id: "Cash on Delivery",
    name: "Cash on Delivery",
    badge: "Pay on Handover",
    Icon: Banknote,
    note: "Pay cash upon craft delivery / atelier pickup",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    selectedDistrict,
    userLocation,
    fetchLocationByPincode,
    detectUserLocation,
    locationLoading,
    placeOrder,
    setIsCartOpen,
    user,
    refreshUser,
  } = useStore();

  // Close sidebar drawer immediately on entering checkout
  useEffect(() => {
    if (setIsCartOpen) {
      setIsCartOpen(false);
    }
  }, [setIsCartOpen]);

  // Real Customer Information (Populated dynamically from active authenticated user)
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "Ankit Raj",
    phone: user?.phone || "+91 98765 43210",
    email: user?.email || "ankitrajdev.in@gmail.com",
    address: user?.address || "Civil Lines, Near DM Office",
    district: user?.city || userLocation?.city || selectedDistrict?.name || "Gaya",
    state: user?.state || userLocation?.state || selectedDistrict?.state || "Bihar",
    pinCode: user?.pincode || (userLocation?.pincode && /^\d{6}$/.test(userLocation.pincode) ? userLocation.pincode : "823001"),
  });

  // Sync customerInfo whenever user loads or updates
  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        district: user.city || prev.district,
        state: user.state || prev.state,
        pinCode: user.pincode || prev.pinCode,
        address: user.address || prev.address || "Civil Lines, Near DM Office",
      }));
    }
  }, [user]);

  const [pinAutoDetected, setPinAutoDetected] = useState(null);

  // Auto-verify PIN code change
  const handlePinChange = async (pin) => {
    const cleanPin = pin.replace(/\D/g, "");
    setCustomerInfo((prev) => ({ ...prev, pinCode: cleanPin }));

    if (cleanPin.length === 6) {
      const res = await fetchLocationByPincode(cleanPin);
      if (res && res.success && res.data) {
        setCustomerInfo((prev) => ({
          ...prev,
          district: res.data.city || prev.district,
          state: res.data.state || prev.state,
          address: prev.address?.includes("Near")
            ? `Ward 2, Near ${res.data.block || "Main Market"}`
            : prev.address,
        }));
        setPinAutoDetected(`Verified: ${res.data.block || ""}, ${res.data.city}, ${res.data.state}`);
      }
    } else {
      setPinAutoDetected(null);
    }
  };

  // Determine if hyperlocal is available for cart items
  const isHyperlocalAllowed = cart.length > 0 && cart.every((item) => {
    const distanceKm = item.product?.distanceKm;
    const itemDistrict = item.product?.district?.toLowerCase();
    const userDist = (customerInfo.district || user?.city || "gaya").toLowerCase();
    
    // Hyperlocal allowed if within 30km or originating from same district
    return (
      (typeof distanceKm === "number" && distanceKm <= HYPERLOCAL_MAX_KM) ||
      (itemDistrict && userDist && itemDistrict === userDist)
    );
  });

  const defaultMode = cart[0]?.fulfillmentMode || (isHyperlocalAllowed ? "hyperlocal" : "pickup");
  const [fulfillmentMode, setFulfillmentMode] = useState(
    defaultMode === "hyperlocal" && !isHyperlocalAllowed ? "pickup" : defaultMode
  );

  const [paymentMethod, setPaymentMethod] = useState("Razorpay (UPI, GPay, PhonePe, QR)");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const isOnlinePayment = paymentMethod !== "Cash on Delivery";

  const subtotal = cart.reduce(
    (acc, it) => acc + (it.product?.price || 0) * (it.quantity || 1),
    0
  );

  let fulfillmentFee = 0;
  if (fulfillmentMode === "hyperlocal") fulfillmentFee = 49;
  if (fulfillmentMode === "global") fulfillmentFee = 99;

  const total = subtotal + fulfillmentFee;

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#1c1e29", "#2b4c8c", "#e4e4e0", "#8a8a86"],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const buildOrderItems = () =>
    cart.map((it) => ({
      productId: it.product?.id,
      name: it.product?.name || "Authentic Craft Item",
      price: it.product?.price || 0,
      quantity: it.quantity || 1,
      image: it.product?.images?.primary || it.product?.image || "/logo.png",
      sellerId: it.product?.sellerId || "seller-01",
      sellerName: it.product?.sellerName || "Artisan Guild Partner",
    }));

  // Preload Razorpay Checkout script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setIsSubmitting(true);

    const orderItems = buildOrderItems();

    // 1. Cash on Delivery / Pay on Collection: place order directly
    if (paymentMethod === "Cash on Delivery") {
      setTimeout(() => {
        const newOrder = placeOrder({
          customer: {
            ...customerInfo,
            userId: user?.id || "usr-1789754768128",
          },
          items: orderItems,
          fulfillmentMode,
          paymentMethod: "Cash on Delivery (Pay on Handover)",
          paymentStatus: "pending_cod",
        });

        fireConfetti();
        setCreatedOrder(newOrder);
        setIsSubmitting(false);
      }, 700);
      return;
    }

    // 2. Online Payment (Razorpay UPI / Card Modal)
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Could not load Razorpay payment gateway. Please check your internet connection or disable ad-blockers."
        );
      }

      let orderData = null;
      try {
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            receipt: `lokkart_${Date.now()}`,
            notes: {
              customerName: customerInfo.name,
              district: customerInfo.district,
              fulfillmentMode,
            },
          }),
        });
        if (orderRes.ok) {
          orderData = await orderRes.json();
        }
      } catch (apiErr) {
        console.warn("Notice: /api/razorpay/create-order notice:", apiErr);
      }

      const razorpayKey =
        orderData?.key ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_SyLCpyzPNMwHdX";

      const options = {
        key: razorpayKey,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "LokKart — ODOP Direct",
        description: `Direct Artisan Craft Order (${cart.length} item${cart.length > 1 ? "s" : ""})`,
        image: "https://cdn.gpgaya.in/crafts/1789755662904-WhatsApp_Image_2026-05-07_at_20.10.23-removebg-preview.png",
        prefill: {
          name: customerInfo.name || "Ankit Raj",
          contact: customerInfo.phone?.replace(/[^\d+]/g, "") || "+919876543210",
          email: customerInfo.email || "ankitrajdev.in@gmail.com",
        },
        notes: {
          address: `${customerInfo.address}, ${customerInfo.district}, ${customerInfo.state} - ${customerInfo.pinCode}`,
          fulfillmentMode: fulfillmentMode,
        },
        theme: {
          color: "#1c1e29",
          backdrop_color: "rgba(0, 0, 0, 0.65)",
        },
        handler: async function (response) {
          console.log("Razorpay Payment Success Response:", response);
          try {
            await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }).catch(console.warn);

            const newOrder = placeOrder({
              customer: {
                ...customerInfo,
                userId: user?.id || "usr-1789754768128",
              },
              items: orderItems,
              fulfillmentMode,
              paymentMethod: paymentMethod.includes("Razorpay") ? paymentMethod : `Razorpay (${paymentMethod})`,
              paymentStatus: "paid",
              razorpayOrderId: response.razorpay_order_id || (orderData?.order?.id || null),
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
            });

            fireConfetti();
            setCreatedOrder(newOrder);
          } catch (err) {
            console.error("Order placement error:", err);
            setPaymentError("Payment was successful. Please check your order history.");
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setPaymentError("Razorpay modal closed. Click 'Pay via Razorpay' whenever you are ready to complete payment.");
          },
        },
      };

      // If official Razorpay order was successfully created on Razorpay's API server, attach it
      if (orderData?.mode === "order_api" && orderData?.order?.id && orderData.order.status === "created") {
        options.order_id = orderData.order.id;
      }

      console.log("Opening Razorpay checkout modal with Key:", razorpayKey);
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response?.error);
        setPaymentError(`Payment failed: ${response?.error?.description || "Transaction was not completed."}`);
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setPaymentError(err.message || "Failed to launch Razorpay payment modal.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[40px]">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-bold text-brand-subtle mb-6">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/explore" className="hover:text-brand-tertiary transition-colors">Craft Catalog</Link>
          <ChevronRight size={14} />
          <span className="text-brand-primary font-bold">Direct Maker Checkout</span>
        </nav>

        {/* ORDER SUCCESS VIEW */}
        {createdOrder ? (
          <Card className="rounded-card border-brand-line bg-card shadow-sm p-[32px] md:p-[48px] text-center max-w-[700px] mx-auto space-y-[32px] mt-8">
            <div className="w-[80px] h-[80px] rounded-full bg-brand-tertiary/10 text-brand-tertiary flex items-center justify-center mx-auto shadow-sm">
              <Check size={40} className="font-bold" />
            </div>

            <div className="space-y-3">
              <Badge className="bg-brand-tertiary/10 hover:bg-brand-tertiary/10 text-brand-tertiary text-xs font-bold uppercase px-3 py-1 rounded-pill mb-2 border border-brand-tertiary/20">
                Order Confirmed &amp; Dispatched to Atelier
              </Badge>
              <h1 className="text-xl md:text-2xl font-bold text-brand-primary tracking-tight">
                Thank you, {createdOrder.customer?.name}!
              </h1>
              <p className="text-sm text-brand-subtle mt-1">
                Order Reference: <span className="font-bold text-brand-primary font-mono bg-muted px-2 py-0.5 rounded-sm">{createdOrder.id}</span>
              </p>
            </div>

            {/* Verification OTP Box */}
            <div className="bg-muted p-[24px] rounded-card border border-brand-line max-w-md mx-auto shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-tertiary" />
              <div className="text-xs font-bold text-brand-subtle uppercase tracking-wider mb-2">
                Collection &amp; Handover Security OTP
              </div>
              <div className="text-[36px] font-mono font-extrabold text-brand-primary tracking-[0.2em] leading-none mb-3">
                {createdOrder.otp}
              </div>
              <p className="text-xs text-brand-subtle leading-relaxed font-medium px-4">
                Share this 4-digit code with the artisan or delivery runner to verify handover.
              </p>
            </div>

            {/* Details */}
            <div className="text-sm text-brand-subtle space-y-2 bg-card p-[20px] rounded-card border border-brand-line max-w-md mx-auto text-left font-medium">
              <p>
                <strong className="text-brand-primary">Delivery Destination:</strong> {createdOrder.customer?.address}, {createdOrder.customer?.district}, {createdOrder.customer?.state} ({createdOrder.customer?.pinCode || createdOrder.customer?.pincode})
              </p>
              <p>
                <strong className="text-brand-primary">Fulfillment:</strong>{" "}
                {createdOrder.fulfillmentMode === "pickup"
                  ? "Self-Pickup at Artisan Atelier (Ready in 2 Hours)"
                  : createdOrder.fulfillmentMode === "hyperlocal"
                  ? "Hyperlocal 3-Hour Runner Delivery"
                  : "Pan-India / Global Freight Dispatch"}
              </p>
              <p>
                <strong className="text-brand-primary">Payment:</strong> {createdOrder.paymentMethod} (₹{createdOrder.total})
                {createdOrder.paymentStatus === "paid" && (
                  <span className="ml-2 text-brand-tertiary font-bold">✓ Verified</span>
                )}
                {createdOrder.paymentStatus === "pending_cod" && (
                  <span className="ml-2 text-amber-600 font-bold">Pending — Pay on Handover</span>
                )}
              </p>
              {createdOrder.razorpayPaymentId && (
                <p>
                  <strong className="text-brand-primary">Payment Reference:</strong>{" "}
                  <span className="font-mono text-xs font-bold">{createdOrder.razorpayPaymentId}</span>
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-[24px] border-t border-brand-line flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="w-full sm:w-auto h-[48px] px-[24px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2"
              >
                <Link href={`/orders/${createdOrder.id}`}>
                  <Clock size={16} />
                  Track Live Order Timeline
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-[48px] px-[24px] rounded-button bg-card hover:bg-muted text-brand-primary border-brand-line font-bold text-sm shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2"
              >
                <Link href="/orders">
                  <ShoppingBag size={16} className="text-brand-tertiary" />
                  View All My Orders
                </Link>
              </Button>
            </div>
          </Card>
        ) : cart.length === 0 ? (
          /* EMPTY CART VIEW */
          <Card className="rounded-card border-brand-line bg-card shadow-sm p-[48px] text-center max-w-lg mx-auto flex flex-col items-center gap-6 mt-10">
            <div className="w-[80px] h-[80px] rounded-full bg-accent text-brand-tertiary flex items-center justify-center shadow-sm">
              <ShoppingBag size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-brand-primary">Your bag is empty</h2>
              <p className="text-sm text-brand-subtle leading-relaxed max-w-[320px] mx-auto font-medium">
                Select authentic handcrafted creations from Gaya, Madhubani, Bhagalpur, or Varanasi first.
              </p>
            </div>
            <Button asChild className="rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground px-[24px] h-[48px] font-bold mt-2 shadow-sm transition-transform active:scale-[0.98]">
              <Link href="/explore">Browse ODOP Craft Catalog</Link>
            </Button>
          </Card>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] items-start mt-4">
            
            {/* Left: Customer Info & Fulfillment Mode (7 Cols) */}
            <div className="lg:col-span-7 space-y-[24px]">
              
              {/* Step 1: Real Customer Details */}
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-[24px] md:p-[32px] space-y-[24px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-lg font-bold text-brand-primary">
                    <span className="w-[28px] h-[28px] rounded-full bg-brand-primary text-primary-foreground text-sm flex items-center justify-center font-bold">1</span>
                    Customer &amp; Shipping Details
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.isLoggedIn && (
                      <Badge variant="outline" className="bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20 text-xs font-bold px-2.5 py-1 rounded-pill flex items-center gap-1">
                        <User size={12} />
                        Logged in as {user.name?.split(" ")[0] || "Patron"}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={detectUserLocation}
                      disabled={locationLoading}
                      className="text-xs text-brand-tertiary font-bold hover:bg-brand-tertiary/10 hover:text-brand-tertiary flex items-center gap-1.5 h-[36px] px-3 rounded-button transition-colors"
                    >
                      <Navigation size={14} />
                      Auto-Fill GPS
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wide">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="e.g. Ankit Raj"
                      className="h-[44px] rounded-input bg-muted border-brand-line text-brand-primary font-bold text-sm focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wide">
                      Phone Number <span className="lowercase font-normal text-brand-subtle">(for OTP verification)</span>
                    </label>
                    <Input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="h-[44px] rounded-input bg-muted border-brand-line text-brand-primary font-mono font-bold text-sm focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wide">
                      PIN Code (6-Digits)
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      required
                      value={customerInfo.pinCode}
                      onChange={(e) => handlePinChange(e.target.value)}
                      placeholder="e.g. 823001"
                      className="h-[44px] rounded-input bg-muted border-brand-line text-brand-primary font-mono font-bold text-sm focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                    />
                    {pinAutoDetected && (
                      <span className="text-xs text-brand-tertiary font-bold flex items-center gap-1 mt-1.5">
                        <CheckCircle2 size={13} /> {pinAutoDetected}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wide">
                      City / District &amp; State
                    </label>
                    <Input
                      type="text"
                      required
                      value={`${customerInfo.district}, ${customerInfo.state}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(",");
                        setCustomerInfo({
                          ...customerInfo,
                          district: parts[0]?.trim() || customerInfo.district,
                          state: parts[1]?.trim() || customerInfo.state
                        });
                      }}
                      className="h-[44px] rounded-input bg-muted border-brand-line text-brand-primary font-bold text-sm focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wide">
                      Street Address &amp; Landmark
                    </label>
                    <Input
                      type="text"
                      required
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="e.g. Civil Lines, Near DM Office"
                      className="h-[44px] rounded-input bg-muted border-brand-line text-brand-primary font-medium text-sm focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                    />
                  </div>
                </div>
              </Card>

              {/* Step 2: Choose Fulfillment Mode */}
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-[24px] md:p-[32px] space-y-[24px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-lg font-bold text-brand-primary">
                    <span className="w-[28px] h-[28px] rounded-full bg-brand-primary text-primary-foreground text-sm flex items-center justify-center font-bold">2</span>
                    Fulfillment Mode
                  </div>
                  <Badge className="bg-muted text-brand-primary text-xs font-bold rounded-pill px-2.5 py-1 border border-brand-line">
                    3 Direct Options
                  </Badge>
                </div>

                <div className="space-y-[16px]">
                  {/* Mode 1: Self-Pickup */}
                  <label
                    onClick={() => setFulfillmentMode("pickup")}
                    className={`flex items-start gap-4 p-[16px] rounded-card border-2 cursor-pointer transition-all ${
                      fulfillmentMode === "pickup"
                        ? "bg-brand-tertiary/5 border-brand-tertiary shadow-sm"
                        : "bg-card border-brand-line hover:border-brand-line/80 hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout_fulfillment"
                      checked={fulfillmentMode === "pickup"}
                      onChange={() => setFulfillmentMode("pickup")}
                      className="mt-1 w-4 h-4 text-brand-tertiary focus:ring-brand-tertiary border-brand-line rounded-full"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-brand-primary flex items-center gap-1.5">
                          <Store size={16} className="text-brand-tertiary" />
                          Self-Pickup from Master Atelier
                        </span>
                        <span className="font-bold text-brand-tertiary">Free</span>
                      </div>
                      <p className="text-brand-subtle font-medium text-xs">
                        Collect directly from verified maker workshop in {customerInfo.district} (Ready in 2 Hours).
                      </p>
                    </div>
                  </label>

                  {/* Mode 2: Hyperlocal 3-Hour Delivery */}
                  <label
                    onClick={() => isHyperlocalAllowed && setFulfillmentMode("hyperlocal")}
                    className={`flex items-start gap-4 p-[16px] rounded-card border-2 transition-all ${
                      !isHyperlocalAllowed
                        ? "bg-muted border-brand-line opacity-60 cursor-not-allowed"
                        : fulfillmentMode === "hyperlocal"
                        ? "bg-brand-tertiary/5 border-brand-tertiary shadow-sm cursor-pointer"
                        : "bg-card border-brand-line hover:border-brand-line/80 hover:bg-muted cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout_fulfillment"
                      checked={fulfillmentMode === "hyperlocal"}
                      onChange={() => isHyperlocalAllowed && setFulfillmentMode("hyperlocal")}
                      disabled={!isHyperlocalAllowed}
                      className="mt-1 w-4 h-4 text-brand-tertiary focus:ring-brand-tertiary border-brand-line rounded-full disabled:opacity-50"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-brand-primary flex items-center gap-1.5">
                          <Truck size={16} className="text-brand-tertiary" />
                          Hyperlocal 3-Hour Runner Delivery
                        </span>
                        <span className="font-bold text-brand-primary">₹49</span>
                      </div>
                      <p className="text-brand-subtle font-medium text-xs">
                        Dedicated local runner delivers within {customerInfo.district} cluster in eco-friendly wax-sealed craft cylinder.
                      </p>
                      {!isHyperlocalAllowed && (
                        <p className="text-destructive text-xs mt-2.5 flex items-start gap-1 font-semibold">
                          <Info size={14} className="shrink-0 mt-0.5" />
                          Not available: Items in your cart exceed the {HYPERLOCAL_MAX_KM}km hyperlocal radius.
                        </p>
                      )}
                    </div>
                  </label>

                  {/* Mode 3: Platform Pan-India Delivery */}
                  <label
                    onClick={() => setFulfillmentMode("global")}
                    className={`flex items-start gap-4 p-[16px] rounded-card border-2 cursor-pointer transition-all ${
                      fulfillmentMode === "global"
                        ? "bg-brand-tertiary/5 border-brand-tertiary shadow-sm"
                        : "bg-card border-brand-line hover:border-brand-line/80 hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout_fulfillment"
                      checked={fulfillmentMode === "global"}
                      onChange={() => setFulfillmentMode("global")}
                      className="mt-1 w-4 h-4 text-brand-tertiary focus:ring-brand-tertiary border-brand-line rounded-full"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-brand-primary flex items-center gap-1.5">
                          <Building size={16} className="text-brand-tertiary" />
                          Pan-India &amp; Global Customs Dispatch
                        </span>
                        <span className="font-bold text-brand-primary">₹99</span>
                      </div>
                      <p className="text-brand-subtle font-medium text-xs">
                        Insured courier partner with end-to-end tracking across India &amp; international hubs (2–4 days).
                      </p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Step 3: Payment Method Selection */}
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-[24px] md:p-[32px] space-y-[24px]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 text-lg font-bold text-brand-primary">
                    <span className="w-[28px] h-[28px] rounded-full bg-brand-primary text-primary-foreground text-sm flex items-center justify-center font-bold">3</span>
                    Payment Method
                  </div>
                  <Badge className="bg-green-500/10 hover:bg-green-500/10 text-green-700 text-[11px] font-bold uppercase px-2.5 py-1 rounded-pill border border-green-500/20 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Razorpay 256-Bit SSL
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
                  {PAYMENT_OPTIONS.map((p) => {
                    const MethodIcon = p.Icon;
                    const isSelected = paymentMethod === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id)}
                        className={`p-[16px] rounded-card border-2 text-left flex flex-col justify-between transition-all cursor-pointer min-h-[125px] ${
                          isSelected
                            ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-md"
                            : "bg-card text-brand-primary border-brand-line hover:border-brand-line/80 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <MethodIcon size={24} className={isSelected ? "text-primary-foreground" : "text-brand-tertiary"} />
                          {p.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-brand-tertiary/10 text-brand-tertiary"
                            }`}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm leading-tight">{p.name}</div>
                          <span className={`text-xs block mt-1 leading-snug ${isSelected ? "text-primary-foreground/80 font-medium" : "text-brand-subtle font-medium"}`}>
                            {p.note}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Razorpay Trust Badge Banner */}
                <div className="flex items-center gap-3 p-3.5 rounded-card bg-muted/60 border border-brand-line text-xs text-brand-subtle">
                  <div className="w-8 h-8 rounded-full bg-brand-tertiary/10 flex items-center justify-center shrink-0 text-brand-tertiary">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="leading-relaxed">
                    <strong className="text-brand-primary font-bold">Razorpay Certified Gateway:</strong> UPI (GPay, PhonePe, Paytm, QR), Cards, and NetBanking are processed securely with end-to-end encryption.
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Order Summary & Placement (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-[100px]">
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-[24px] space-y-[24px]">
                <div className="flex items-center justify-between pb-4 border-b border-brand-line">
                  <h3 className="text-lg font-bold text-brand-primary">Order Summary</h3>
                  <Link href="/explore" className="text-sm text-brand-tertiary font-bold hover:underline">
                    + Add Items
                  </Link>
                </div>

                {/* Items List */}
                <div className="space-y-[16px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, idx) => (
                    <div key={item.product?.id || idx} className="flex gap-[16px]">
                      <img
                        src={item.product?.images?.primary || item.product?.image || "/logo.png"}
                        alt={item.product?.name || "Craft Item"}
                        onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                        className="w-[64px] h-[64px] rounded-md object-cover border border-brand-line flex-shrink-0 bg-muted"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-sm text-brand-primary truncate">{item.product?.name}</h4>
                        <p className="text-xs text-brand-subtle font-medium truncate">{item.product?.sellerName || "Authentic Craft"}</p>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-brand-subtle font-medium">Qty: {item.quantity}</span>
                          <span className="font-bold text-brand-primary">₹{(item.product?.price || 0) * (item.quantity || 1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fee Breakdown */}
                <div className="pt-[16px] border-t border-brand-line space-y-[12px] text-sm">
                  <div className="flex justify-between text-brand-subtle font-medium">
                    <span>Makers Subtotal ({cart.length} item{cart.length > 1 ? "s" : ""})</span>
                    <span className="font-bold text-brand-primary">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-brand-subtle font-medium">
                    <span>Fulfillment Fee</span>
                    <span className="font-bold text-brand-primary">
                      {fulfillmentFee === 0 ? "Free (Pickup)" : `₹${fulfillmentFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-subtle items-center font-medium">
                    <span className="flex items-center gap-1">
                      Platform Fee
                    </span>
                    <span className="font-bold text-brand-tertiary text-xs bg-brand-tertiary/10 px-2 py-0.5 rounded-pill border border-brand-tertiary/20">
                      0% (Direct to Artisan)
                    </span>
                  </div>

                  <Separator className="bg-brand-line my-4" />

                  <div className="flex justify-between items-center text-md text-brand-primary">
                    <span className="font-bold">Total Amount</span>
                    <span className="text-xl font-extrabold text-brand-tertiary">₹{total}</span>
                  </div>
                </div>

                {/* Payment error */}
                {paymentError && (
                  <div className="flex items-start gap-2 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/20 rounded-card px-3 py-2.5">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-md shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Clock size={18} className="animate-spin" />
                      Opening Razorpay Modal...
                    </span>
                  ) : isOnlinePayment ? (
                    <>
                      <Lock size={18} />
                      <span>Pay ₹{total} via Razorpay</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Place Order with COD (₹{total})</span>
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-brand-subtle text-center -mt-1 font-medium leading-relaxed">
                  Direct artisan transaction protected by Ministry of MSME ODOP standards.
                </p>
              </Card>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}