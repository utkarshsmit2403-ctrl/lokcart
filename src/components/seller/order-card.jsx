"use client";

import Link from "next/link";
import { CheckCircle2, PackageCheck, ShieldCheck, Store, Truck } from "lucide-react";
import StatusBadge from "./status-badge";

const NEXT_ACTION = {
  placed: { next: "preparing", label: "Accept & start packing", icon: PackageCheck, className: "bg-brand-primary text-primary-foreground hover:bg-brand-secondary" },
  preparing: { next: "ready_for_pickup", label: "Mark ready for pickup", icon: ShieldCheck, className: "bg-brand-tertiary text-tertiary-foreground hover:bg-tertiary-hover" },
  ready_for_pickup: { next: "completed", label: "Confirm handover", icon: CheckCircle2, className: "bg-emerald-700 text-white hover:bg-emerald-800" },
  out_for_delivery: { next: "completed", label: "Confirm handover", icon: CheckCircle2, className: "bg-emerald-700 text-white hover:bg-emerald-800" },
};

export default function OrderCard({ order, onAdvance, compact = false }) {
  const action = NEXT_ACTION[order.status];
  const ActionIcon = action?.icon;
  const ModeIcon = order.fulfillmentMode === "pickup" ? Store : Truck;

  return (
    <div className="bg-card rounded-card border border-brand-line shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-line">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-input bg-brand-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <ModeIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-brand-primary">Order #{order.id}</span>
            <span className="text-xs text-brand-subtle ml-2">
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className={`grid grid-cols-1 ${compact ? "sm:grid-cols-1" : "md:grid-cols-3"} gap-3 py-3 text-xs`}>
        <div>
          <span className="text-brand-subtle block font-bold uppercase text-[10px] mb-0.5">Customer</span>
          <p className="font-bold text-brand-primary">{order.customer.name}</p>
          <p className="text-brand-subtle">
            {order.items.map((it) => `${it.name} (x${it.quantity})`).join(", ")}
          </p>
        </div>

        {!compact && (
          <>
            <div>
              <span className="text-brand-subtle block font-bold uppercase text-[10px] mb-0.5">Fulfillment</span>
              <p className="font-bold text-brand-primary">
                {order.fulfillmentMode === "pickup" ? "Self-pickup from atelier" : "Hyperlocal delivery"}
              </p>
              <p className="text-brand-subtle">Handover OTP: <span className="font-mono font-bold text-brand-primary">{order.otp}</span></p>
            </div>
            <div>
              <span className="text-brand-subtle block font-bold uppercase text-[10px] mb-0.5">Payout due</span>
              <p className="font-extrabold text-brand-primary text-sm">₹{order.total.toLocaleString("en-IN")}</p>
              <p className="text-brand-subtle">{order.paymentMethod}</p>
            </div>
          </>
        )}
      </div>

      <div className="pt-3 border-t border-brand-line flex flex-wrap items-center justify-end gap-2">
        {order.status === "completed" ? (
          <span className="text-xs text-emerald-800 font-extrabold flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-button">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Fulfilled
          </span>
        ) : action ? (
          <button
            onClick={() => onAdvance(order.id, action.next)}
            className={`h-[36px] px-3.5 rounded-button text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-1.5 cursor-pointer ${action.className}`}
          >
            {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
            {action.label}
          </button>
        ) : null}

        {compact && (
          <Link
            href="/seller/orders"
            className="h-[36px] px-3.5 rounded-button border border-brand-line text-xs font-bold text-brand-primary hover:bg-muted flex items-center"
          >
            View in Orders
          </Link>
        )}
      </div>
    </div>
  );
}