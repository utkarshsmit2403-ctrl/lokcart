"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { detectDistrictFromSearch } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  Search,
  X,
  Grid,
  Zap,
  Store,
  Menu,
  User,
  LogOut,
  Receipt,
  ShoppingBag,
  LayoutGrid
} from "lucide-react";

const NAV_LINKS = [
  { href: "/categories", label: "Categories", icon: LayoutGrid, match: "/categories" },
  { href: "/explore", label: "ODOP", icon: Grid, match: "/explore" },
  { href: "/explore?radius=10km", label: "Nearby", icon: Zap },
  { href: "/#stores", label: "Artisans", icon: Store },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    districts,
    userLocation,
    getUserOwnDistrict,
    setIsDistrictModalOpen,
    cart,
    searchQuery,
    setSearchQuery,
    user,
    logout,
  } = useStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle outside click & escape key to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen]);

  // Close menus on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const totalCartCount = isMounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const cartSubtotal = isMounted ? cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) : 0;
  const isHomePage = pathname === "/";

  const locationLabel = (isMounted && userLocation)
    ? `${userLocation.city}${userLocation.pincode ? ` (${userLocation.pincode})` : ""}`
    : "Gaya (823001)";

  const runSearch = (query) => {
    setSearchQuery(query);
    const ownDist = getUserOwnDistrict ? getUserOwnDistrict() : userLocation?.city || "";

    if (!query) {
      router.push(ownDist ? `/explore?originDistrict=${encodeURIComponent(ownDist)}` : "/explore");
      return;
    }

    const detectedDist = detectDistrictFromSearch(query, districts);
    const district = detectedDist || ownDist;
    const params = new URLSearchParams();
    if (district) params.set("originDistrict", district);
    params.set("search", query);
    router.push(`/explore?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch((localSearch || "").trim());
  };

  const openLocationModal = () => {
    setIsDistrictModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-line bg-card shadow-sm antialiased">
      {/* Main Top Row */}
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-4 md:h-[76px] md:gap-6 md:px-8">

        {/* ================= LEFT SECTION: DYNAMIC LOGO & LOCATION ================= */}
        <div className="flex shrink-0 flex-1 md:flex-none items-center gap-3 md:gap-4 overflow-hidden">

          {/* Swiggy Style Mobile Back Button OR Logo */}
          <div className="flex items-center">
            {!isHomePage ? (
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-brand-primary hover:bg-brand-line transition-colors md:hidden mr-2"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="shrink-0" />
              </button>
            ) : (
              <Link href="/" className="flex shrink-0 items-center md:hidden mr-3">
                <Image
                  src="/logo.png"
                  alt="Lokart Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-md object-contain shadow-sm border border-brand-line"
                />
              </Link>
            )}

            {/* Desktop Logo (Always visible on MD+) */}
            <Link href="/" className="hidden md:flex shrink-0 items-center gap-2">
              <Image
                src="/logo.png"
                alt="Lokart Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-contain shadow-sm border border-brand-line"
              />
              <div className="flex flex-col leading-none">
                <span className="text-[20px] font-extrabold tracking-tight text-brand-primary">Lokart</span>
                <span className="mt-1 text-[10px] font-bold uppercase text-brand-subtle tracking-wider">Direct from artisans</span>
              </div>
            </Link>
          </div>

          <span className="hidden h-8 w-px bg-brand-line md:block" />

          {/* Location Picker */}
          <button
            onClick={openLocationModal}
            className="flex flex-col items-start justify-center text-left group min-w-0"
          >
            <div className="flex items-center gap-1">
              <span className="truncate text-xs md:text-sm font-bold text-brand-primary group-hover:text-brand-tertiary transition-colors">
                Delivery in 3 Hours
              </span>
              <ChevronDown size={14} className="shrink-0 text-brand-tertiary" />
            </div>
            <span className="truncate w-full text-[11px] md:text-xs font-medium text-brand-subtle mt-0.5">
              {locationLabel}
            </span>
          </button>
        </div>

        {/* ================= CENTER: DESKTOP SEARCH ================= */}
        <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-xl md:block mx-4">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 shrink-0 text-brand-subtle" />
            <Input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search for organic food, painting, handloom..."
              className="h-[44px] w-full rounded-input border-brand-line bg-muted pl-11 pr-10 text-sm font-bold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:border-brand-tertiary focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  setSearchQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-subtle hover:text-brand-primary transition-colors rounded-full hover:bg-brand-line"
              >
                <X size={16} className="shrink-0" />
              </button>
            )}
          </div>
        </form>

        {/* ================= RIGHT SECTION: NAV, PROFILE, CART ================= */}
        <div className="flex shrink-0 items-center gap-3 md:gap-5">

          {/* Nav links (Desktop) */}
          <nav className="hidden items-center gap-6 text-sm font-bold lg:flex">
            {NAV_LINKS.map((link) => {
              const active = link.match && pathname === link.match;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 transition-colors duration-200 ${active ? "text-brand-tertiary" : "text-brand-primary hover:text-brand-tertiary"
                    }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-[3px] rounded-t-full bg-brand-tertiary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Custom Profile Dropdown (Desktop/Tablet) */}
          {isMounted && user ? (
            <div className="relative hidden sm:block" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                className={`flex h-[40px] items-center gap-2 rounded-button px-2.5 text-sm font-bold text-brand-primary hover:bg-muted border border-brand-line transition-all select-none ${profileDropdownOpen ? "bg-muted ring-2 ring-brand-tertiary/20 border-brand-tertiary/50" : ""
                  }`}
              >
                <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-tertiary text-xs font-bold text-tertiary-foreground shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </span>
                <span className="max-w-[90px] truncate text-xs md:text-sm">{user.name.split(" ")[0]}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-brand-subtle transition-transform duration-200 ${profileDropdownOpen ? "rotate-180 text-brand-primary" : ""
                    }`}
                />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-brand-line bg-card p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                  role="menu"
                >
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 rounded-button bg-muted/60 border border-brand-line/50 mb-1">
                    <p className="truncate text-sm font-bold text-brand-primary">{user.name}</p>
                    <p className="truncate text-xs font-medium text-brand-subtle mt-0.5">
                      {user.phone || user.email || "Verified User"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    <Link
                      href="/account"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-button px-3 py-2 text-sm font-bold text-brand-primary hover:bg-muted transition-colors group"
                      role="menuitem"
                    >
                      <User size={20} className="shrink-0 text-brand-tertiary group-hover:scale-110 transition-transform" />
                      <div className="flex-1 truncate">
                        <span className="block leading-tight">My Account</span>
                        <span className="block text-[10px] font-medium text-brand-subtle mt-0.5">Profile & settings</span>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openLocationModal();
                      }}
                      className="flex w-full text-left items-center gap-3 rounded-button px-3 py-2 text-sm font-bold text-brand-primary hover:bg-muted transition-colors group"
                      role="menuitem"
                    >
                      <MapPin size={20} className="shrink-0 text-brand-tertiary group-hover:scale-110 transition-transform" />
                      <div className="flex-1 truncate">
                        <span className="block leading-tight">Delivery address</span>
                        <span className="block truncate text-[10px] font-medium text-brand-subtle mt-0.5">{locationLabel}</span>
                      </div>
                    </button>

                    <Link
                      href="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-button px-3 py-2 text-sm font-bold text-brand-primary hover:bg-muted transition-colors group"
                      role="menuitem"
                    >
                      <Receipt size={20} className="shrink-0 text-brand-tertiary group-hover:scale-110 transition-transform" />
                      <div className="flex-1 truncate">
                        <span className="block leading-tight">Your orders</span>
                        <span className="block text-[10px] font-medium text-brand-subtle mt-0.5">Track & view history</span>
                      </div>
                    </Link>
                  </div>

                  <div className="h-px bg-brand-line my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors group"
                    role="menuitem"
                  >
                    <LogOut size={20} className="shrink-0 text-destructive group-hover:scale-110 transition-transform" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="h-[40px] items-center gap-1.5 rounded-button px-4 text-sm font-bold text-brand-primary hover:bg-muted border border-transparent hover:border-brand-line"
              >
                Log in
              </Button>
            </Link>
          )}

          {/* Cart CTA */}
          <Button
            asChild
            size="sm"
            aria-label={`Cart with ${totalCartCount} items`}
            className="h-[44px] gap-2 rounded-button bg-brand-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary-hover shadow-sm active:scale-[0.98] transition-transform"
          >
            <Link href="/cart">
              <ShoppingBag size={20} className={`shrink-0 ${totalCartCount > 0 ? "fill-white/20" : ""}`} />
              {totalCartCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span>{totalCartCount}</span>
                  <span className="text-white/40 hidden sm:inline">·</span>
                  <span className="hidden sm:inline">₹{cartSubtotal}</span>
                </span>
              ) : (
                <span className="hidden sm:inline">Cart</span>
              )}
            </Link>
          </Button>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-[44px] w-[44px] items-center justify-center rounded-button text-brand-primary bg-muted hover:bg-brand-line transition-colors lg:hidden"
          >
            {mobileMenuOpen ? <X size={24} className="shrink-0" /> : <Menu size={24} className="shrink-0" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE SEARCH BAR (Rendered Under Nav) ================= */}
      <div className="block border-t border-brand-line bg-card px-4 pb-3 pt-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 shrink-0 text-brand-subtle" />
          <Input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search groceries, crafts..."
            className="h-[44px] w-full rounded-input border-brand-line bg-muted pl-10 pr-10 text-sm font-bold text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary shadow-sm"
          />
          {localSearch && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setLocalSearch("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-primary h-8 w-8 rounded-full"
            >
              <X size={16} className="shrink-0" />
            </Button>
          )}
        </form>
      </div>

      {/* ================= MOBILE MENU PANEL ================= */}
      {mobileMenuOpen && (
        <div className="space-y-1 border-t border-brand-line bg-card p-4 lg:hidden shadow-lg absolute w-full left-0 z-50">
          {NAV_LINKS.map((link) => {
            const IconComp = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 rounded-button px-4 py-3.5 text-sm font-bold transition-colors duration-150 ${link.match && pathname === link.match
                    ? "bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20"
                    : "text-brand-primary hover:bg-muted border border-transparent"
                  }`}
              >
                <IconComp size={20} className="shrink-0" />
                {link.label}
              </Link>
            );
          })}

          {(!isMounted || !user) && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-4 rounded-button mt-4 px-4 py-3.5 text-sm font-bold text-brand-primary bg-muted border border-brand-line hover:border-brand-primary transition-colors sm:hidden"
            >
              <User size={20} className="shrink-0 text-brand-tertiary" />
              Log in / Sign up
            </Link>
          )}

          {(isMounted && user) && (
            <>
              <div className="h-px my-3 bg-brand-line sm:hidden" />
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center gap-4 rounded-button px-4 py-3.5 text-sm font-bold text-brand-primary hover:bg-muted transition-colors sm:hidden"
              >
                <User size={20} className="shrink-0 text-brand-tertiary" />
                My Account
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center gap-4 rounded-button px-4 py-3.5 text-sm font-bold text-brand-primary hover:bg-muted transition-colors sm:hidden"
              >
                <Receipt size={20} className="shrink-0 text-brand-tertiary" />
                Your Orders
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="flex w-full items-center gap-4 rounded-button mt-2 px-4 py-3.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors sm:hidden"
              >
                <LogOut size={20} className="shrink-0" />
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}