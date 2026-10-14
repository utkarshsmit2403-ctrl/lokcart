"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    login,
    logout,
    userLocation,
  } = useStore();

  const [inputMode, setInputMode] = useState("phone"); // "phone" | "email"
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState("input"); // "input" | "otp"
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (inputMode === "phone") {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number");
        return;
      }
    } else {
      if (!emailInput.trim() || !emailInput.includes("@")) {
        setErrorMsg("Please enter a valid email address");
        return;
      }
    }

    if (authMode === "signup" && !fullName.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const recipient = inputMode === "phone" ? `+91${phoneNumber}` : emailInput.trim();
      const channel = inputMode === "phone" ? "whatsapp" : "email";
      
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, channel })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setIsLoading(false);
      setStep("otp");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  const handleOtpChange = (idx, val) => {
    const clean = val.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[idx] = clean;
    setOtp(newOtp);

    if (clean && idx < 3) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 4) {
      setErrorMsg("Please enter the 4-digit code sent to your mobile/email");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const recipient = inputMode === "phone" ? `+91${phoneNumber}` : emailInput.trim();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recipient, 
          code: entered,
          name: authMode === "signup" ? fullName.trim() : undefined
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");

      setIsLoading(false);

      login({
        id: data.user.id,
        name: data.user.name,
        phone: data.user.phone,
        email: data.user.email,
        city: data.user.city || userLocation?.city || "Gaya",
        pincode: data.user.pincode || userLocation?.pincode || "823001",
        state: data.user.state || userLocation?.state || "Bihar",
        token: data.token
      });

      router.push("/");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  const activeContactValue = inputMode === "phone" ? phoneNumber : emailInput;

  return (
    <div className="min-h-screen bg-background text-brand-primary flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-[56px] flex items-center justify-center">
        {/* Main Split Panel Container */}
        <Card className="w-full bg-card rounded-md border border-brand-line shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-5 min-h-[520px]">
          
          {/* Left Panel (Premium Brand Look) */}
          <div className="md:col-span-2 bg-gradient-to-br from-brand-primary to-brand-secondary text-primary-foreground p-[32px] md:p-[40px] flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <span className="text-xl md:text-2xl font-bold tracking-tight block">
                {user ? "Your Profile" : authMode === "login" ? "Welcome Back" : "Looks like you're new here!"}
              </span>
              <p className="text-sm text-primary-foreground/80 leading-relaxed font-medium">
                {user
                  ? "Manage your active orders, shipping addresses, and GI-tag authenticity certificates."
                  : authMode === "login"
                  ? "Login to access your orders, exclusive ODOP offers, artisan rewards and recommendations."
                  : "Sign up with your mobile number to get started with direct-from-artisan quick commerce."}
              </p>
            </div>

            {/* Bottom Graphic Emblem */}
            <div className="relative z-10 pt-[32px]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c1ecd4] uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Government ODOP Guild</span>
              </div>
              <p className="text-xs text-primary-foreground/70 leading-relaxed">
                100% Certified GI-Tagged Artisan Products Delivered Across 750+ Indian Districts.
              </p>
            </div>

            {/* Background Watermark Icon */}
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[200px] text-white/5 pointer-events-none select-none">
              workspace_premium
            </span>
          </div>

          {/* Right Form Container */}
          <div className="md:col-span-3 bg-card p-[32px] md:p-[40px] flex flex-col justify-between space-y-[24px]">
            {user ? (
              /* Logged-In State */
              <div className="my-auto space-y-[24px]">
                <div className="flex items-center gap-[16px] p-[20px] rounded-card bg-muted border border-brand-line shadow-sm">
                  <div className="w-[56px] h-[56px] rounded-full bg-brand-tertiary text-tertiary-foreground flex items-center justify-center font-bold text-xl shadow-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name.charAt(0) : "U"
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-brand-primary flex items-center gap-2">
                      {user.name}
                      <Badge className="bg-brand-tertiary/10 hover:bg-brand-tertiary/10 text-brand-tertiary text-[10px] font-bold px-2 py-0.5 rounded-pill border border-brand-tertiary/20">
                        Active
                      </Badge>
                    </h3>
                    <p className="text-xs text-brand-subtle mt-1 font-medium">{user.phone} • {user.email}</p>
                    <p className="text-xs text-brand-primary font-bold mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-brand-tertiary">location_on</span>
                      {userLocation?.city || user.city || "Gaya"} ({userLocation?.pincode || user.pincode || "823001"})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-[44px] rounded-button bg-card hover:bg-muted text-brand-primary font-bold text-sm border-brand-line shadow-sm transition-transform active:scale-[0.98]"
                  >
                    <Link href="/explore">Browse Catalog</Link>
                  </Button>
                  <Button
                    onClick={() => logout()}
                    variant="destructive"
                    className="w-full h-[44px] rounded-button font-bold text-sm shadow-sm transition-transform active:scale-[0.98]"
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            ) : step === "input" ? (
              /* Step 1: Input Form */
              <form onSubmit={handleSendOtp} className="flex-1 flex flex-col justify-between space-y-[24px]">
                <div className="space-y-[24px]">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-brand-primary tracking-tight">
                      {authMode === "login" ? "Log in for the best experience" : "Create Account"}
                    </h3>
                    <p className="text-sm text-brand-subtle mt-1">
                      {inputMode === "phone"
                        ? "Enter your 10-digit mobile number to continue"
                        : "Enter your email address to continue"}
                    </p>
                  </div>

                  {/* Input Field Section */}
                  <div className="space-y-[16px]">
                    {inputMode === "phone" ? (
                      <div className="relative flex items-center rounded-input bg-card border border-brand-line focus-within:border-brand-tertiary focus-within:ring-1 focus-within:ring-brand-tertiary shadow-sm overflow-hidden transition-all h-[48px]">
                        <button
                          type="button"
                          className="h-full px-[16px] bg-muted text-sm font-bold text-brand-primary flex items-center gap-1 border-r border-brand-line"
                        >
                          <span>+91</span>
                          <span className="material-symbols-outlined text-[16px] text-brand-subtle">arrow_drop_down</span>
                        </button>
                        <Input
                          type="text"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value.replace(/\D/g, ""));
                            setErrorMsg(null);
                          }}
                          placeholder="Enter Phone Number"
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm font-semibold text-brand-primary placeholder:text-brand-subtle px-[16px]"
                        />
                      </div>
                    ) : (
                      <div className="relative flex items-center rounded-input bg-card border border-brand-line focus-within:border-brand-tertiary focus-within:ring-1 focus-within:ring-brand-tertiary shadow-sm overflow-hidden transition-all h-[48px]">
                        <Input
                          type="email"
                          value={emailInput}
                          onChange={(e) => {
                            setEmailInput(e.target.value);
                            setErrorMsg(null);
                          }}
                          placeholder="Enter Email Address"
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-full px-[16px] text-sm font-semibold text-brand-primary placeholder:text-brand-subtle"
                        />
                      </div>
                    )}

                    {/* Toggle Modifiers */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode(inputMode === "phone" ? "email" : "phone");
                          setErrorMsg(null);
                        }}
                        className="text-xs font-bold text-brand-tertiary hover:underline cursor-pointer"
                      >
                        {inputMode === "phone" ? "Use Email instead" : "Use Phone Number instead"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === "login" ? "signup" : "login");
                          setErrorMsg(null);
                        }}
                        className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                      >
                        {authMode === "login" ? "New to Lokart? Create account" : "Existing user? Log in"}
                      </button>
                    </div>

                    {authMode === "signup" && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-brand-subtle mb-1.5 uppercase tracking-wide">Full Name</label>
                        <Input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your name"
                          className="h-[44px] rounded-input bg-muted border-brand-line text-sm font-semibold text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                        />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-[12px] rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Disclaimer & Action */}
                <div className="space-y-[16px] pt-[16px] border-t border-brand-line">
                  <p className="text-[11px] text-brand-subtle leading-relaxed">
                    By continuing, you confirm that you are above 18 years of age, and you agree to Lokart&apos;s{" "}
                    <Link href="#" className="text-brand-primary font-bold hover:underline">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-brand-primary font-bold hover:underline">
                      Privacy Policy
                    </Link>.
                  </p>

                  <Button
                    type="submit"
                    disabled={isLoading || !activeContactValue}
                    className="w-full h-[48px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-70 disabled:active:scale-100 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Step 2: 4-digit OTP Verification */
              <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col justify-between space-y-[24px]">
                <div className="space-y-[24px]">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-brand-primary tracking-tight">
                      Verify OTP
                    </h3>
                    <p className="text-sm text-brand-subtle mt-1 leading-relaxed">
                      Verification code sent to{" "}
                      <strong className="text-brand-primary font-bold">
                        {inputMode === "phone" ? `+91 ${phoneNumber}` : emailInput}
                      </strong>{" "}
                      <button
                        type="button"
                        onClick={() => setStep("input")}
                        className="text-brand-tertiary font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Change
                      </button>
                    </p>
                  </div>

                  {/* 4-digit OTP Boxes */}
                  <div className="flex justify-center gap-[12px] my-[32px]">
                    {otp.map((digit, idx) => (
                      <Input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-[56px] h-[56px] text-center text-xl font-bold rounded-input bg-muted border-2 border-brand-line focus-visible:border-brand-tertiary focus-visible:ring-0 text-brand-primary shadow-sm"
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="p-[12px] rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-[16px] pt-[16px] border-t border-brand-line">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[48px] rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(["", "", "", ""]);
                        setErrorMsg(null);
                        handleSendOtp({ preventDefault: () => {} });
                      }}
                      className="text-xs text-brand-subtle hover:text-brand-primary font-medium cursor-pointer transition-colors"
                    >
                      Didn&apos;t receive OTP? <span className="text-brand-tertiary font-bold ml-1 hover:underline">Resend Code</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}