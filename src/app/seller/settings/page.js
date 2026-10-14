"use client";

import React, { useState } from "react";
import { useSellerData } from "@/components/seller/seller-data-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Store,
  Bell,
  Building2,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  User
} from "lucide-react";

export default function SellerSettingsPage() {
  const {
    seller,
    updateSeller,
    bankDetails,
    updateBankDetails,
    notifications,
    updateNotifications
  } = useSellerData();

  const [activeTab, setActiveTab] = useState("brand"); // "brand" | "password" | "notifications" | "bank"
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Brand Form State
  const [brandForm, setBrandForm] = useState({
    name: seller.name,
    artisan: seller.artisan,
    district: seller.district,
    state: seller.state,
    bio: seller.bio || "",
    avatar: seller.avatar,
    banner: seller.banner || "",
    phone: seller.phone || "",
    email: seller.email || "",
    gstin: seller.gstin || "",
  });

  // Bank Form State
  const [bankForm, setBankForm] = useState({ ...bankDetails });

  const handleSaveBrand = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      updateSeller(brandForm);
      setSuccessMsg("Atelier brand details updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMsg("Security password changed successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      updateBankDetails(bankForm);
      setSuccessMsg("Bank account details updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary">Seller Account & Atelier Settings</h2>
          <p className="text-xs font-medium text-brand-subtle">
            Manage your password, brand details, notification preferences, and payout bank account
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-[16px] rounded-card bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Navigation Tabs */}
      <Card className="p-[16px] rounded-card border-brand-line bg-card shadow-sm">
        <div className="flex bg-muted p-1 rounded-button border border-brand-line w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {[
            { key: "brand", label: "Brand & Atelier", icon: Store },
            { key: "password", label: "Change Password", icon: Lock },
            { key: "notifications", label: "Notifications", icon: Bell },
            { key: "bank", label: "Bank Details", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-input whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-card text-brand-primary shadow-sm"
                    : "text-brand-subtle hover:text-brand-primary"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-brand-tertiary" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab 1: Brand & Atelier Details */}
      {activeTab === "brand" && (
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <h3 className="text-md font-bold text-brand-primary pb-3 border-b border-brand-line flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-tertiary" /> Atelier & Brand Profile
          </h3>

          <form onSubmit={handleSaveBrand} className="space-y-[16px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Atelier / Business Name *</label>
                <Input
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Lead Artisan Name *</label>
                <Input
                  required
                  value={brandForm.artisan}
                  onChange={(e) => setBrandForm({ ...brandForm, artisan: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">District *</label>
                <Input
                  required
                  value={brandForm.district}
                  onChange={(e) => setBrandForm({ ...brandForm, district: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">State *</label>
                <Input
                  required
                  value={brandForm.state}
                  onChange={(e) => setBrandForm({ ...brandForm, state: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Avatar Image URL</label>
                <Input
                  value={brandForm.avatar}
                  onChange={(e) => setBrandForm({ ...brandForm, avatar: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Cover Banner URL</label>
                <Input
                  value={brandForm.banner}
                  onChange={(e) => setBrandForm({ ...brandForm, banner: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Craft Bio & Collective History</label>
                <textarea
                  rows={3}
                  value={brandForm.bio}
                  onChange={(e) => setBrandForm({ ...brandForm, bio: e.target.value })}
                  className="w-full p-3 bg-muted border border-brand-line rounded-input text-xs font-bold text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-[44px] px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Brand Profile</>}
            </Button>
          </form>
        </Card>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === "password" && (
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <h3 className="text-md font-bold text-brand-primary pb-3 border-b border-brand-line flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-tertiary" /> Change Security Password
          </h3>

          <form onSubmit={handleSavePassword} className="space-y-[16px] max-w-md">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Current Password</label>
              <Input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">New Password</label>
              <Input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Confirm New Password</label>
              <Input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-type new password"
                className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-[44px] px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Update Password</>}
            </Button>
          </form>
        </Card>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === "notifications" && (
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <h3 className="text-md font-bold text-brand-primary pb-3 border-b border-brand-line flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-tertiary" /> Notification Preferences
          </h3>

          <div className="space-y-[14px]">
            {[
              { key: "smsOrders", title: "SMS Alerts for New Orders", desc: "Receive immediate SMS notification when a customer places an order." },
              { key: "whatsappUpdates", title: "WhatsApp Order & Dispatch Updates", desc: "Receive automated WhatsApp messages for OTP verification & returns." },
              { key: "lowStockAlerts", title: "Low Variant Stock Warnings", desc: "Get alerted when color variants (e.g. White Saree) drop below 3 units." },
              { key: "emailPayouts", title: "Email Payout & Settlement Statements", desc: "Receive weekly PDF receipts for bank payouts every Tuesday." },
            ].map((item) => (
              <div key={item.key} className="p-[16px] rounded-card bg-muted border border-brand-line flex items-center justify-between gap-[12px]">
                <div>
                  <h4 className="text-xs font-bold text-brand-primary">{item.title}</h4>
                  <p className="text-[11px] font-medium text-brand-subtle">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => updateNotifications(item.key, e.target.checked)}
                  className="w-5 h-5 rounded-input border-brand-line text-brand-tertiary focus:ring-brand-tertiary cursor-pointer"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Bank Details */}
      {activeTab === "bank" && (
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <div className="flex items-center justify-between pb-3 border-b border-brand-line">
            <h3 className="text-md font-bold text-brand-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-tertiary" /> Payout Bank Account Details
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
              {bankForm.verificationStatus}
            </Badge>
          </div>

          <form onSubmit={handleSaveBank} className="space-y-[16px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Account Holder Name *</label>
                <Input
                  required
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Bank Name *</label>
                <Input
                  required
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Bank Account Number *</label>
                <Input
                  required
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">IFSC Code *</label>
                <Input
                  required
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Branch Location</label>
                <Input
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">UPI ID (Instant Settlement)</label>
                <Input
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-[44px] px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Bank Details</>}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
