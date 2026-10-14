"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/context/StoreContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Package,
  Camera,
  Edit3,
  ExternalLink,
  LogOut,
  ArrowRight,
  ChevronRight,
  Loader2,
  Save,
  X,
  AlertCircle
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser, logout, orders } = useStore();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "addresses" | "orders"
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoadingUser, setIsLoadingUser] = useState(!user);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch real user data directly from /api/auth/me
  useEffect(() => {
    async function loadAuthProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            if (setUser) {
              setUser((prev) => ({ ...prev, ...data.user, isLoggedIn: true }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load /api/auth/me:", err);
      } finally {
        setIsLoadingUser(false);
      }
    }
    loadAuthProfile();
  }, [setUser]);

  // Keep form data synced with real user profile
  useEffect(() => {
    const active = currentUser || user;
    if (active) {
      setFormData({
        name: active.name || "",
        phone: active.phone || "",
        city: active.city || "",
        state: active.state || "Bihar",
        pincode: active.pincode || "",
      });
    }
  }, [currentUser, user]);

  const activeUser = currentUser || user;

  // Handle avatar upload via presigned URL and persist via PUT /api/auth/me
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // 1. Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate upload URL");
      }

      // 2. Upload to Cloudflare R2
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // 3. Update database via PUT /api/auth/me
      const updateRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { avatar: data.publicUrl } }),
      });

      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.success) {
        setCurrentUser(updateData.user);
        if (setUser) {
          setUser((prev) => ({ ...prev, ...updateData.user, isLoggedIn: true }));
        }
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Save profile edits to MongoDB via PUT /api/auth/me
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      setCurrentUser(data.user);
      if (setUser) {
        setUser((prev) => ({ ...prev, ...data.user, isLoggedIn: true }));
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Format creation timestamp
  const memberSince = activeUser?.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "September 2026";

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <Loader2 size={36} className="animate-spin text-brand-tertiary" />
          <p className="text-sm font-bold text-brand-subtle mt-4">Loading your account profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <Card className="w-full bg-card rounded-card border-brand-line shadow-sm p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-muted text-brand-tertiary flex items-center justify-center mx-auto">
              <User size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-brand-primary">Sign in to your account</h2>
              <p className="text-sm text-brand-subtle max-w-sm mx-auto">
                Access your real profile, saved shipping addresses, and direct orders.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto w-full">
              <Button asChild className="w-full h-[44px] rounded-button bg-brand-primary hover:bg-primary-hover font-bold text-sm text-primary-foreground">
                <Link href="/login">Log In / Register</Link>
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-primary font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-brand-subtle mb-6">
          <Link href="/" className="hover:text-brand-tertiary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-primary">My Account</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-brand-primary tracking-tight">
              Customer Account
            </h1>
            <p className="text-xs md:text-sm font-medium text-brand-subtle mt-0.5">
              Manage your personal credentials, delivery destinations, and order links.
            </p>
          </div>

          <Button asChild variant="outline" className="h-[40px] gap-2 rounded-button border-brand-line font-bold text-xs hover:border-brand-primary">
            <Link href="/orders">
              <Package size={16} className="text-brand-tertiary" />
              <span>Go to Orders Page</span>
              <ExternalLink size={14} className="text-brand-subtle" />
            </Link>
          </Button>
        </div>

        {/* Feedback Alerts */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-card bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in-0 duration-200">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-4 rounded-card bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* ================= LEFT SIDEBAR ================= */}
          <Card className="lg:col-span-1 rounded-card border-brand-line bg-card shadow-sm p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-brand-primary text-primary-foreground text-2xl font-bold flex items-center justify-center shadow-md border-2 border-brand-tertiary overflow-hidden">
                  {activeUser.avatar ? (
                    <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full object-cover" />
                  ) : (
                    activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  aria-label="Upload profile picture"
                  className="absolute bottom-0 right-0 bg-brand-tertiary hover:bg-brand-primary text-white rounded-full p-1.5 shadow-md cursor-pointer transition-transform group-hover:scale-105"
                  title="Change avatar"
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-brand-primary">{activeUser.name}</h2>
                <p className="text-xs font-medium text-brand-subtle mt-0.5">{activeUser.phone}</p>
                <p className="text-xs font-medium text-brand-subtle truncate max-w-[190px]">{activeUser.email}</p>
              </div>

              <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase">
                {activeUser.isVerified ? "Verified Customer" : "Customer"}
              </Badge>
            </div>

            <Separator className="bg-brand-line" />

            {/* Sidebar Navigation */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between p-2.5 rounded-button text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-brand-primary text-primary-foreground shadow-sm"
                    : "text-brand-subtle hover:text-brand-primary hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User size={18} />
                  <span>Personal Profile</span>
                </div>
                {activeTab === "profile" && <ChevronRight size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center justify-between p-2.5 rounded-button text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-brand-primary text-primary-foreground shadow-sm"
                    : "text-brand-subtle hover:text-brand-primary hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin size={18} />
                  <span>Delivery Address</span>
                </div>
                {activeTab === "addresses" && <ChevronRight size={14} />}
              </button>

              <Link
                href="/orders"
                className="w-full flex items-center justify-between p-2.5 rounded-button text-xs font-bold text-brand-subtle hover:text-brand-primary hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package size={18} />
                  <span>Your Orders</span>
                </div>
                <ExternalLink size={14} className="text-brand-subtle" />
              </Link>
            </div>

            <Separator className="bg-brand-line" />

            <Button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              variant="destructive"
              className="w-full h-[40px] rounded-button text-xs font-bold shadow-sm gap-2"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </Card>

          {/* ================= RIGHT CONTENT AREA ================= */}
          <div className="lg:col-span-3 space-y-6">
            {/* TAB: PROFILE DETAILS */}
            {activeTab === "profile" && (
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-brand-line">
                  <div>
                    <h2 className="text-lg font-bold text-brand-primary">Profile Information</h2>
                    <p className="text-xs text-brand-subtle mt-0.5">Real verified data linked with your account</p>
                  </div>

                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-2 h-9 rounded-button text-xs font-bold border-brand-line hover:border-brand-primary"
                    >
                      <Edit3 size={14} />
                      <span>Edit Details</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="gap-1.5 h-9 rounded-button text-xs font-bold text-brand-subtle hover:text-brand-primary"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </Button>
                  )}
                </div>

                {!isEditing ? (
                  /* Display Mode with Real Data */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-muted rounded-card border border-brand-line/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-brand-subtle font-bold uppercase text-[10px]">
                        <User size={12} />
                        <span>Full Name</span>
                      </div>
                      <p className="text-brand-primary font-bold text-sm">{activeUser.name || "—"}</p>
                    </div>

                    <div className="p-3.5 bg-muted rounded-card border border-brand-line/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-brand-subtle font-bold uppercase text-[10px]">
                        <Phone size={12} />
                        <span>Mobile Phone</span>
                      </div>
                      <p className="text-brand-primary font-bold text-sm font-mono">{activeUser.phone || "—"}</p>
                    </div>

                    <div className="p-3.5 bg-muted rounded-card border border-brand-line/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-brand-subtle font-bold uppercase text-[10px]">
                        <Mail size={12} />
                        <span>Email Address</span>
                      </div>
                      <p className="text-brand-primary font-bold text-sm">{activeUser.email || "—"}</p>
                    </div>

                    <div className="p-3.5 bg-muted rounded-card border border-brand-line/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-brand-subtle font-bold uppercase text-[10px]">
                        <MapPin size={12} />
                        <span>Location / District</span>
                      </div>
                      <p className="text-brand-primary font-bold text-sm">
                        {activeUser.city || "Gaya"}, {activeUser.state || "Bihar"} {activeUser.pincode ? `(${activeUser.pincode})` : ""}
                      </p>
                    </div>

                    <div className="p-3.5 bg-muted rounded-card border border-brand-line/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-brand-subtle font-bold uppercase text-[10px]">
                        <Calendar size={12} />
                        <span>Member Since</span>
                      </div>
                      <p className="text-brand-primary font-bold text-sm">{memberSince}</p>
                    </div>

                    <div className="p-3.5 bg-muted rounded-card border border-brand-line/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-brand-subtle font-bold uppercase text-[10px]">
                        <ShieldCheck size={12} />
                        <span>Verification Status</span>
                      </div>
                      <p className="text-brand-primary font-bold text-sm flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span>{activeUser.isVerified ? "Phone & Email Verified" : "Customer"}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode Form */
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-primary">Full Name</label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-[42px] rounded-input border-brand-line bg-muted font-bold text-sm text-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-primary">Mobile Phone</label>
                        <Input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-[42px] rounded-input border-brand-line bg-muted font-bold text-sm text-brand-primary font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-primary">Email (Verified)</label>
                        <Input
                          type="email"
                          disabled
                          value={activeUser.email || ""}
                          className="h-[42px] rounded-input border-brand-line bg-muted/50 font-medium text-sm text-brand-subtle cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-primary">City / District</label>
                        <Input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-[42px] rounded-input border-brand-line bg-muted font-bold text-sm text-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-primary">State</label>
                        <Input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="h-[42px] rounded-input border-brand-line bg-muted font-bold text-sm text-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-primary">Pincode</label>
                        <Input
                          type="text"
                          required
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="h-[42px] rounded-input border-brand-line bg-muted font-bold text-sm text-brand-primary font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-brand-line">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="h-[40px] px-4 rounded-button text-xs font-bold"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-[40px] px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Profile</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === "addresses" && (
              <Card className="rounded-card border-brand-line bg-card shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-brand-line">
                  <div>
                    <h2 className="text-lg font-bold text-brand-primary">Delivery Address</h2>
                    <p className="text-xs text-brand-subtle mt-0.5">Primary delivery destination for ODOP orders</p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("profile")}
                    className="gap-2 h-9 rounded-button text-xs font-bold border-brand-line hover:border-brand-primary"
                  >
                    <Edit3 size={14} />
                    <span>Edit Address</span>
                  </Button>
                </div>

                <div className="p-5 bg-muted rounded-card border border-brand-line space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-primary text-sm">{activeUser.name}</span>
                    <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 text-[10px] font-bold uppercase px-2 py-0.5 rounded-pill">
                      Default Shipping Address
                    </Badge>
                  </div>

                  <p className="text-brand-primary text-sm font-semibold leading-relaxed">
                    {activeUser.city || "Gaya"}, {activeUser.state || "Bihar"} - {activeUser.pincode || "823001"}
                  </p>

                  <div className="pt-2 border-t border-brand-line/60 flex flex-wrap items-center gap-4 text-brand-subtle font-medium text-xs">
                    <span>Contact Phone: <strong className="text-brand-primary font-mono">{activeUser.phone}</strong></span>
                    <span>·</span>
                    <span>Email: <strong className="text-brand-primary">{activeUser.email}</strong></span>
                  </div>
                </div>
              </Card>
            )}

            {/* ORDERS SECTION CALLOUT (Redirects to /orders) */}
            <Card className="rounded-card border-brand-line bg-muted/40 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-brand-tertiary" />
                    <h3 className="text-base font-bold text-brand-primary">Looking for your Orders?</h3>
                  </div>
                  <p className="text-xs text-brand-subtle max-w-lg">
                    Track live deliveries, review GI-tag authenticity certificates, and view handover security OTPs on the dedicated Orders page.
                  </p>
                </div>

                <Button asChild className="h-[42px] px-5 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs gap-2 shrink-0">
                  <Link href="/orders">
                    <span>View All Orders</span>
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>

              {orders && orders.length > 0 && (
                <div className="pt-3 border-t border-brand-line/60 text-xs text-brand-subtle flex items-center justify-between">
                  <span>You have <strong>{orders.length}</strong> active order(s) on file.</span>
                  <Link href="/orders" className="text-brand-tertiary font-bold hover:underline flex items-center gap-1">
                    <span>Track Latest Order</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
