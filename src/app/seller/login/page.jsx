"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ShieldCheck, ArrowLeft, Loader2, Lock, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSellerData } from "@/components/seller/seller-data-context";

export default function SellerLoginPage() {
  const router = useRouter();
  const { loginSeller } = useSellerData();

  const [loginMethod, setLoginMethod] = useState("otp"); // "otp" | "password"
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("input"); // "input" | "otp"
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // 2-Minute Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const recipientValue = `+91${phone.replace(/\D/g, "")}`;

  const handleContinue = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    setSuccessInfo(null);
    setIsLoading(true);

    if (loginMethod === "password") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: recipientValue, password })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Password authentication failed.");
        }

        setIsLoading(false);
        if (data.seller) {
          loginSeller(data.seller);
        } else {
           // Fallback in case API returns user but no seller object structure perfectly
           loginSeller(data.user);
        }
        router.push("/seller");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.message);
      }
    } else {
      // OTP method
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: recipientValue, channel: "whatsapp" })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (res.status === 429 && data.cooldownRemaining) {
            setCooldownSeconds(data.cooldownRemaining);
          }
          throw new Error(data.error || "Failed to send OTP code.");
        }

        setIsLoading(false);
        setStep("otp");
        setCooldownSeconds(120); // Set 2-minute countdown
        setSuccessInfo(data.message || "OTP code sent via Meta WhatsApp API.");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.message);
      }
    }
  };

  const handleOtpChange = (idx, val) => {
    const clean = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    if (clean && idx < 3) {
      document.getElementById(`login-otp-${idx + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 4) {
      setErrorMsg("Enter the 4-digit verification code.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: recipientValue, code: entered })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid or expired OTP.");
      }

      setIsLoading(false);
      loginSeller(data.seller);
      router.push("/seller");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };



  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background text-brand-primary flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[48px] flex items-center justify-center">
        <Card className="w-full bg-card rounded-card border-brand-line shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-5 min-h-[520px]">
          {/* Left panel - Solid bg-brand-primary, no gradients */}
          <div className="md:col-span-2 bg-brand-primary text-primary-foreground p-[32px] md:p-[40px] flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-[16px]">
              <div className="w-[48px] h-[48px] rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight block">
                Welcome back, Artisan
              </h2>
              <p className="text-sm text-primary-foreground/80 leading-relaxed font-medium">
                Log back in to manage live customer orders, variant inventory stock, ODOP payout settlements, and support.
              </p>


            </div>

            <div className="relative z-10 pt-[32px] border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c1ecd4] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>ODOP Verified Guild</span>
              </div>
              <p className="text-xs text-primary-foreground/70 leading-relaxed font-medium">
                Every artisan account is linked with government district handicraft nodal offices.
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="md:col-span-3 bg-card p-[32px] md:p-[40px] flex flex-col justify-between space-y-[24px]">
            {step === "input" ? (
              <form onSubmit={handleContinue} className="flex-1 flex flex-col justify-between space-y-[24px]">
                <div className="space-y-[20px]">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-line">
                    <h3 className="text-lg font-bold text-brand-primary">Seller Sign In</h3>
                    <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
                      Verified Panel
                    </Badge>
                  </div>

                  {/* Method toggle */}
                  <div className="flex bg-muted p-1 rounded-button border border-brand-line">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod("otp"); setErrorMsg(null); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-input transition-colors cursor-pointer ${
                        loginMethod === "otp"
                          ? "bg-card text-brand-primary shadow-sm"
                          : "text-brand-subtle hover:text-brand-primary"
                      }`}
                    >
                      Login via Mobile OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod("password"); setErrorMsg(null); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-input transition-colors cursor-pointer ${
                        loginMethod === "password"
                          ? "bg-card text-brand-primary shadow-sm"
                          : "text-brand-subtle hover:text-brand-primary"
                      }`}
                    >
                      Login via Password
                    </button>
                  </div>

                  <div className="space-y-[14px]">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                        Registered Mobile Number
                      </label>
                      <div className="relative flex items-center rounded-input bg-muted border border-brand-line focus-within:border-brand-tertiary overflow-hidden h-[44px]">
                        <span className="px-3 text-sm font-bold text-brand-subtle border-r border-brand-line flex items-center h-full">+91</span>
                        <Input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="98765 43210"
                          className="border-0 focus-visible:ring-0 h-full px-3 text-sm font-bold text-brand-primary bg-transparent"
                        />
                      </div>
                    </div>

                    {loginMethod === "password" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                          Password (Bcrypt Hash Verified)
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your seller password"
                          className="h-[44px] bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary"
                        />
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="space-y-[14px] pt-[16px] border-t border-brand-line">
                  <Button
                    type="submit"
                    disabled={isLoading || phone.length !== 10}
                    className="w-full h-[48px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : loginMethod === "otp" ? "Send WhatsApp OTP Code" : "Sign In with Password"}
                  </Button>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <Link href="/seller/register" className="font-bold text-brand-tertiary hover:underline">
                      New Artisan? Register Atelier
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col justify-between space-y-[24px]">
                <div className="space-y-[24px]">
                  <div>
                    <h3 className="text-lg font-bold text-brand-primary">Verify WhatsApp OTP Code</h3>
                    <p className="text-sm font-medium text-brand-subtle mt-1">
                      Code sent to <strong className="text-brand-primary font-bold">+91 {phone}</strong>
                    </p>
                  </div>

                  {successInfo && (
                    <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 font-bold">
                      {successInfo}
                    </div>
                  )}

                  <div className="flex justify-center gap-[12px] my-[24px]">
                    {otp.map((digit, idx) => (
                      <Input
                        key={idx}
                        id={`login-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-[52px] h-[52px] text-center text-xl font-bold rounded-input bg-muted border-2 border-brand-line focus-visible:border-brand-tertiary text-brand-primary shadow-sm"
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium text-center">
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="space-y-[14px] pt-[16px] border-t border-brand-line">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[48px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                  </Button>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setStep("input")}
                      className="font-bold text-brand-subtle hover:text-brand-primary cursor-pointer"
                    >
                      &larr; Back to Input
                    </button>

                    <button
                      type="button"
                      disabled={cooldownSeconds > 0 || isLoading}
                      onClick={handleContinue}
                      className="font-medium text-brand-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {cooldownSeconds > 0 ? (
                        <span className="text-amber-600 font-bold font-mono">
                          Resend in {formatTimer(cooldownSeconds)}
                        </span>
                      ) : (
                        <span className="text-brand-tertiary font-bold hover:underline cursor-pointer">Resend OTP</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Card>
      </main>

      <div className="max-w-[1000px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <Link href="/" className="text-xs font-bold text-brand-subtle hover:text-brand-primary flex items-center gap-1.5 w-fit">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to storefront
        </Link>
      </div>

      <Footer />
    </div>
  );
}