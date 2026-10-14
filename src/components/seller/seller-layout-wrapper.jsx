"use client";

import { usePathname } from "next/navigation";
import { SellerDataProvider } from "@/components/seller/seller-data-context";
import SellerSidebar from "@/components/seller/seller-sidebar";
import SellerMobileNav from "@/components/seller/seller-mobile-nav";
import SellerHeader from "@/components/seller/seller-header";
import SellerAuthGate from "@/components/seller/seller-auth-gate";

export default function SellerLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/seller/login" || pathname === "/seller/register";

  if (isAuthPage) {
    return (
      <SellerDataProvider>
        <div className="min-h-screen bg-background text-brand-primary font-sans antialiased">
          {children}
        </div>
      </SellerDataProvider>
    );
  }

  return (
    <SellerDataProvider>
      <SellerAuthGate>
        <div className="min-h-screen flex bg-background text-brand-primary font-sans antialiased">
          <SellerSidebar />
          <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
            <SellerHeader />
            <main className="flex-1 p-4 md:p-8 max-w-full w-full mx-auto">{children}</main>
          </div>
          <SellerMobileNav />
        </div>
      </SellerAuthGate>
    </SellerDataProvider>
  );
}
