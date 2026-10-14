"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, Building2, CreditCard, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSellerData } from "@/components/seller/seller-data-context";
import { PRODUCT_CATEGORIES } from "@/lib/seller-demo-data";

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { registerSeller } = useSellerData();

  const [step, setStep] = useState(1); // 1: Atelier info, 2: ODOP & Bank info, 3: OTP
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [form, setForm] = useState({
    businessName: "",
    artisanName: "",
    phone: "",
    email: "",
    district: "Madhubani",
    state: "Bihar",
    category: PRODUCT_CATEGORIES[0].value,
    odopId: "",
    gstin: "",
    password: "",
    confirmPassword: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  const [otp, setOtp] = useState(["", "", "", ""]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validateStep1 = () => {
    if (!form.businessName.trim()) return "Please enter your atelier / business name.";
    if (!form.artisanName.trim()) return "Please enter the lead artisan name.";
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) return "Please enter a valid 10-digit mobile number.";
    if (!form.district.trim()) return "Please enter your artisan district.";
    return null;
  };

  const validateStep2 = () => {
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      const err = validateStep1();
      if (err) { setErrorMsg(err); return; }
      setErrorMsg(null);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setErrorMsg(err); return; }
      setErrorMsg(null);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
      }, 400);
    }
  };

  const handleOtpChange = (idx, val) => {
    const clean = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    if (clean && idx < 3) {
      document.getElementById(`reg-otp-${idx + 1}`)?.focus();
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (otp.join("").length < 4) {
      setErrorMsg("Please enter the complete 4-digit OTP.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      registerSeller(form);
      router.push("/seller");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-brand-primary flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1050px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
        <Card className="w-full bg-card rounded-card border border-brand-line shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-5 min-h-[620px]">
          {/* Left panel - Solid bg-brand-primary, no gradients */}
          <div className="md:col-span-2 bg-brand-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight block">
                Join the LokKart Artisan Guild
              </h2>
              <p className="text-xs text-primary-foreground/80 leading-relaxed font-medium">
                Register your atelier to sell directly from your district to nationwide customers. Enjoy 0% platform commission during our government pilot program.
              </p>

              {/* Step indicator list */}
              <div className="pt-6 space-y-3">
                <div className={`flex items-center gap-3 text-xs font-bold ${step >= 1 ? "text-amber-300" : "text-primary-foreground/40"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${step >= 1 ? "bg-amber-300 text-brand-primary border-amber-300" : "border-primary-foreground/40"}`}>1</span>
                  <span>Atelier & Craft Details</span>
                </div>
                <div className={`flex items-center gap-3 text-xs font-bold ${step >= 2 ? "text-amber-300" : "text-primary-foreground/40"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${step >= 2 ? "bg-amber-300 text-brand-primary border-amber-300" : "border-primary-foreground/40"}`}>2</span>
                  <span>ODOP Verification & Payout Bank</span>
                </div>
                <div className={`flex items-center gap-3 text-xs font-bold ${step >= 3 ? "text-amber-300" : "text-primary-foreground/40"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${step >= 3 ? "bg-amber-300 text-brand-primary border-amber-300" : "border-primary-foreground/40"}`}>3</span>
                  <span>Mobile OTP Verification</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c1ecd4] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified District Craft</span>
              </div>
              <p className="text-[11px] text-primary-foreground/70 leading-relaxed">
                Direct bank settlements into your account every Tuesday. Verified by District Nodal Officer.
              </p>
            </div>
          </div>

          {/* Right form panel */}
          <div className="md:col-span-3 bg-card p-6 md:p-10 flex flex-col justify-between space-y-6">
            {step === 1 && (
              <form onSubmit={handleNextStep} className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-line">
                    <div>
                      <h3 className="text-lg font-extrabold text-brand-primary">Step 1: Atelier Profile</h3>
                      <p className="text-xs text-brand-subtle">Tell us about your craft atelier and location.</p>
                    </div>
                    <Badge className="bg-brand-tertiary/10 text-brand-tertiary text-[10px] font-bold px-2 py-0.5 rounded-pill">
                      Step 1 of 3
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Atelier / Business Name *
                      </label>
                      <Input
                        value={form.businessName}
                        onChange={update("businessName")}
                        placeholder="e.g. Sunita Devi Crafts"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Lead Artisan Name *
                      </label>
                      <Input
                        value={form.artisanName}
                        onChange={update("artisanName")}
                        placeholder="e.g. Sunita Devi"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Craft Category *
                      </label>
                      <select
                        value={form.category}
                        onChange={update("category")}
                        className="w-full h-10 px-3 rounded-input bg-muted border border-brand-line text-xs font-semibold text-brand-primary"
                      >
                        {PRODUCT_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Mobile Number * (for OTP)
                      </label>
                      <div className="flex items-center rounded-input bg-muted border border-brand-line h-10 overflow-hidden">
                        <span className="px-3 text-xs font-bold text-brand-subtle border-r border-brand-line">+91</span>
                        <Input
                          type="tel"
                          maxLength={10}
                          value={form.phone}
                          onChange={update("phone")}
                          placeholder="98765 43210"
                          className="border-0 h-full px-2.5 text-xs font-semibold text-brand-primary bg-transparent focus-visible:ring-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Email Address (Optional)
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={update("email")}
                        placeholder="artisan@lokkart.in"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        District *
                      </label>
                      <Input
                        value={form.district}
                        onChange={update("district")}
                        placeholder="e.g. Madhubani"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        State *
                      </label>
                      <Input
                        value={form.state}
                        onChange={update("state")}
                        placeholder="e.g. Bihar"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-brand-line flex items-center justify-between">
                  <Link href="/seller/login" className="text-xs font-bold text-brand-tertiary hover:underline">
                    Already registered? Log In
                  </Link>
                  <Button
                    type="submit"
                    className="h-10 px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold cursor-pointer"
                  >
                    Continue to Step 2 &rarr;
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNextStep} className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-line">
                    <div>
                      <h3 className="text-lg font-extrabold text-brand-primary">Step 2: ODOP, Security & Bank</h3>
                      <p className="text-xs text-brand-subtle">Enter login security password & bank details for payouts.</p>
                    </div>
                    <Badge className="bg-brand-tertiary/10 text-brand-tertiary text-[10px] font-bold px-2 py-0.5 rounded-pill">
                      Step 2 of 3
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Password *
                      </label>
                      <Input
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        placeholder="Minimum 6 characters"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Confirm Password *
                      </label>
                      <Input
                        type="password"
                        value={form.confirmPassword}
                        onChange={update("confirmPassword")}
                        placeholder="Re-type password"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        ODOP / GI ID (Optional)
                      </label>
                      <Input
                        value={form.odopId}
                        onChange={update("odopId")}
                        placeholder="e.g. ODOP-BHG-01"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        GSTIN / Artisan Card No. (Optional)
                      </label>
                      <Input
                        value={form.gstin}
                        onChange={update("gstin")}
                        placeholder="e.g. 10AABCS1429B1Z8"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 pb-1 border-t border-brand-line/60">
                      <p className="text-xs font-bold text-brand-primary flex items-center gap-1.5 mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-brand-tertiary" /> Bank Account for Direct Payouts
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Bank Name
                      </label>
                      <Input
                        value={form.bankName}
                        onChange={update("bankName")}
                        placeholder="e.g. State Bank of India"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        Account Number
                      </label>
                      <Input
                        value={form.accountNumber}
                        onChange={update("accountNumber")}
                        placeholder="e.g. 389201948291"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        IFSC Code
                      </label>
                      <Input
                        value={form.ifscCode}
                        onChange={update("ifscCode")}
                        placeholder="e.g. SBIN0001482"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-brand-subtle uppercase">
                        UPI ID (Instant Settlement)
                      </label>
                      <Input
                        value={form.upiId}
                        onChange={update("upiId")}
                        placeholder="e.g. name@upi"
                        className="h-10 rounded-input bg-muted border-brand-line text-xs font-semibold text-brand-primary"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-brand-line flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-brand-subtle hover:text-brand-primary"
                  >
                    &larr; Back to Step 1
                  </button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP Verification &rarr;"}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-brand-primary">Step 3: Mobile OTP Verification</h3>
                    <p className="text-xs text-brand-subtle mt-1">
                      Verification code sent to <strong className="text-brand-primary font-bold">+91 {form.phone}</strong>
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 my-6">
                    {otp.map((digit, idx) => (
                      <Input
                        key={idx}
                        id={`reg-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-12 text-center text-lg font-bold rounded-input bg-muted border-2 border-brand-line focus-visible:border-brand-tertiary focus-visible:ring-0 text-brand-primary"
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium text-center">
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-brand-line space-y-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration & Launch Seller Panel"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setErrorMsg("New OTP code dispatched via SMS.")}
                      className="text-xs text-brand-subtle hover:text-brand-tertiary font-medium cursor-pointer"
                    >
                      Didn&apos;t receive code? Resend OTP
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Card>
      </main>

      <div className="max-w-[1050px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <Link href="/" className="text-xs font-bold text-brand-subtle hover:text-brand-primary flex items-center gap-1.5 w-fit">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to storefront
        </Link>
      </div>

      <Footer />
    </div>
  );
}
