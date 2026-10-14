"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Truck, PackageSearch, BadgeCheck, LineChart } from "lucide-react";

const TABS = [
  { href: "/seller", label: "Overview", icon: Store, exact: true },
  { href: "/seller/orders", label: "Orders", icon: Truck },
  { href: "/seller/inventory", label: "Inventory", icon: PackageSearch },
  { href: "/seller/odop", label: "ODOP", icon: BadgeCheck },
  { href: "/seller/analytics", label: "Growth", icon: LineChart },
];

export default function SellerMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-brand-line flex items-stretch justify-between px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${
              active ? "text-brand-tertiary" : "text-brand-subtle"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}