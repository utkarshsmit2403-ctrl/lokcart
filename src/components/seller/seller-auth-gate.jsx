"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSellerData } from "./seller-data-context";

export default function SellerAuthGate({ children }) {
  const router = useRouter();
  const { isAuthenticated, isDbLoaded } = useSellerData();

  useEffect(() => {
    if (isDbLoaded && !isAuthenticated) {
      router.replace("/seller/login");
    }
  }, [isAuthenticated, isDbLoaded, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center gap-3 py-24 text-brand-subtle">
        <Loader2 className="w-6 h-6 animate-spin text-brand-tertiary" />
        <p className="text-sm font-semibold">Redirecting to seller login...</p>
      </div>
    );
  }

  return children;
}