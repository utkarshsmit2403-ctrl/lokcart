"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Truck,
  PackageSearch,
  RotateCcw,
  CreditCard,
  HelpCircle,
  Settings,
  Plus,
  ArrowLeft,
  LogOut
} from "lucide-react";
import { useSellerData } from "./seller-data-context";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/seller", label: "Overview", icon: Store, exact: true },
  { href: "/seller/orders", label: "Orders", icon: Truck, countKey: "orders" },
  { href: "/seller/returns", label: "Returns", icon: RotateCcw, countKey: "returns" },
  { href: "/seller/inventory", label: "Inventory & Variants", icon: PackageSearch, countKey: "products" },
  { href: "/seller/payments", label: "Payments & Payouts", icon: CreditCard },
  { href: "/seller/help", label: "Help Center", icon: HelpCircle },
  { href: "/seller/settings", label: "Settings & Profile", icon: Settings },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const { seller, products, orders, returns, logoutSeller } = useSellerData();
  const counts = {
    products: products.length,
    orders: orders.filter((o) => o.status !== "completed").length,
    returns: returns.filter((r) => r.status === "pending").length,
  };

  return (
    <aside className="w-[260px] bg-muted border-r border-brand-line hidden lg:flex flex-col justify-between p-[16px] sticky top-0 h-screen z-40 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-[20px]">
        {/* Brand Header */}
        <div className="flex items-center gap-[12px] px-1 py-1">
          <Image
            src="/logo.png"
            alt="LokKart Logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md object-contain shadow-sm border border-brand-line bg-card"
          />
          <div>
            <span className="text-md font-extrabold text-brand-primary block tracking-tight leading-none">
              LokKart
            </span>
            <span className="text-[10px] font-bold text-brand-tertiary uppercase tracking-wider">
              Artisan Guild
            </span>
          </div>
        </div>

        {/* Seller Profile Pill */}
        <div className="bg-card rounded-card p-[12px] border border-brand-line flex items-center gap-[12px] shadow-sm">
          <img
            src={seller.avatar}
            alt={seller.name}
            className="w-[36px] h-[36px] rounded-input object-cover border border-brand-line flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-brand-primary truncate">{seller.name}</h4>
            <p className="text-[10px] font-medium text-brand-subtle truncate">
              {seller.odopId} &bull; {seller.district}
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href="/seller/products/new"
          className="w-full h-[40px] bg-brand-tertiary hover:bg-tertiary-hover text-tertiary-foreground px-4 rounded-button text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Plus className="" />
          Add New Craft
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-[4px] text-xs">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, countKey }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const count = countKey ? counts[countKey] : null;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-[12px] rounded-button px-[12px] py-[10px] font-bold transition-colors cursor-pointer ${active
                    ? "bg-brand-primary text-primary-foreground shadow-sm"
                    : "text-brand-subtle hover:bg-card hover:text-brand-primary"
                  }`}
              >
                <Icon className=" flex-shrink-0" />
                <span className="truncate">{label}</span>
                {count !== null && count > 0 && (
                  <Badge
                    className={`ml-auto border px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${active
                        ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                        : "bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20"
                      }`}
                  >
                    {count}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-[16px] border-t border-brand-line text-xs text-brand-subtle space-y-[8px]">
        <Link href="/" className="flex items-center gap-[8px] py-1 hover:text-brand-primary font-bold text-xs transition-colors">
          <ArrowLeft className="" />
          Back to Storefront
        </Link>
        <button
          type="button"
          onClick={logoutSeller}
          className="flex items-center gap-[8px] py-1 text-brand-subtle hover:text-destructive font-bold cursor-pointer w-full text-left text-xs transition-colors"
        >
          <LogOut className="" />
          Sign Out Panel
        </button>
        <div className="text-[10px] font-medium text-brand-subtle/70 pt-1">
          LokKart Guild &bull; v2.5
        </div>
      </div>
    </aside>
  );
}