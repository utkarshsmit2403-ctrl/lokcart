"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSellerData } from "./seller-data-context";
import {
  Bell,
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Store
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SellerHeader() {
  const { seller, orders, returns, logoutSeller } = useSellerData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === "placed").length;
  const pendingReturnsCount = returns.filter((r) => r.status === "pending").length;
  const totalAlerts = pendingOrdersCount + pendingReturnsCount;

  return (
    <header className="bg-card border-b border-brand-line sticky top-0 z-30 shadow-sm">
      <div className="px-[16px] md:px-[24px] py-[12px] flex items-center justify-between gap-[16px] bg-card">
        {/* Left: Clean Brand & District Tag */}
        <div className="flex items-center gap-[12px]">
          <div className="relative">
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-[36px] h-[36px] rounded-card object-cover border border-brand-line shadow-xs bg-card"
            />
            <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-card" title="Verified Artisan">
              <CheckCircle2 className="w-2.5 h-2.5" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-[8px]">
              <h1 className="text-sm md:text-md font-extrabold text-brand-primary tracking-tight">
                {seller.name}
              </h1>
              <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className=" mr-1" /> {seller.odopId}
              </Badge>
            </div>
            <p className="text-[11px] font-medium text-brand-subtle">
              {seller.district}, {seller.state} &bull; <span className="text-amber-600 font-bold">&starf; {seller.rating} Rating</span>
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="relative flex-1 max-w-[360px] hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2  text-brand-subtle" />
          <input
            type="text"
            placeholder="Search orders, products, SKUs..."
            className="h-[38px] w-full pl-9 pr-3 bg-muted border border-brand-line rounded-input text-xs font-bold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-[10px]">
          <Link
            href="/seller/products/new"
            className="h-[38px] px-3.5 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-tertiary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="" />
            <span className="hidden md:inline">Add Craft</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="h-[38px] px-3 rounded-button bg-muted hover:bg-card border border-brand-line text-brand-primary text-xs font-bold transition-transform active:scale-[0.98] hidden md:flex items-center gap-1.5"
            title="Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-subtle" />
            Storefront
          </Link>

          <Link
            href="/seller/help"
            className="p-2 text-brand-subtle hover:text-brand-primary rounded-input hover:bg-muted transition-colors relative"
            title="Help Center"
          >
            <HelpCircle className="" />
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-brand-subtle hover:text-brand-primary rounded-input hover:bg-muted transition-colors relative cursor-pointer"
            >
              <Bell className="" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1  bg-destructive text-destructive-foreground text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[300px] bg-card border border-brand-line rounded-card shadow-sm p-[16px] z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-[12px] border-b border-brand-line">
                  <h4 className="text-xs font-bold text-brand-primary">Notifications</h4>
                  <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
                    {totalAlerts} New
                  </Badge>
                </div>
                <div className="divide-y divide-brand-line max-h-[240px] overflow-y-auto py-1 custom-scrollbar">
                  {pendingOrdersCount > 0 && (
                    <Link
                      href="/seller/orders"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-[10px] py-2 hover:bg-muted rounded-input transition-colors px-1"
                    >
                      <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-brand-primary">New Order Received</p>
                        <p className="text-[11px] font-medium text-brand-subtle">{pendingOrdersCount} order(s) pending dispatch.</p>
                      </div>
                    </Link>
                  )}
                  {pendingReturnsCount > 0 && (
                    <Link
                      href="/seller/returns"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-[10px] py-2 hover:bg-muted rounded-input transition-colors px-1"
                    >
                      <span className="p-1 rounded-full bg-amber-500/10 text-amber-600 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-brand-primary">Return Request Pending</p>
                        <p className="text-[11px] font-medium text-brand-subtle">{pendingReturnsCount} claim awaiting review.</p>
                      </div>
                    </Link>
                  )}
                  {totalAlerts === 0 && (
                    <div className="py-6 text-center text-xs text-brand-subtle font-medium">
                      No unread notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-[6px] p-1 pl-2 rounded-button border border-brand-line hover:bg-muted transition-colors cursor-pointer"
            >
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-[22px] h-[22px] rounded-full object-cover"
              />
              <ChevronDown className="w-3.5 h-3.5 text-brand-subtle" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-[200px] bg-card border border-brand-line rounded-card shadow-sm py-[8px] z-50 animate-in fade-in">
                <div className="px-[14px] py-[6px] border-b border-brand-line">
                  <p className="text-xs font-bold text-brand-primary truncate">{seller.name}</p>
                  <p className="text-[10px] font-medium text-brand-subtle truncate">{seller.email}</p>
                </div>
                <Link
                  href="/seller/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-[14px] py-[6px] text-xs font-bold text-brand-primary hover:bg-muted transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-brand-subtle" />
                  Settings & Password
                </Link>
                <Link
                  href="/seller/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-[14px] py-[6px] text-xs font-bold text-brand-primary hover:bg-muted transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-brand-subtle" />
                  Bank & Payouts
                </Link>
                <div className="border-t border-brand-line my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logoutSeller();
                  }}
                  className="w-full flex items-center gap-2 px-[14px] py-[6px] text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
