"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";

export default function QuickCartBar() {
  const { cart, setIsCartOpen } = useStore();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (totalItems === 0) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <aside aria-label="Active Cart Summary" className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 z-40 sm:max-w-md w-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-[#1b4332] hover:bg-[#012d1d] text-white rounded-2xl p-3.5 sm:px-5 shadow-2xl flex items-center justify-between gap-4 cursor-pointer transition-all border border-white/20 focus-visible:ring-2 focus-visible:ring-[#fe8357] focus-visible:outline-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              shopping_bag
            </span>
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider leading-none">
              {totalItems} {totalItems === 1 ? "Craft Item" : "Craft Items"} Added
            </div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              ₹{subtotal.toLocaleString("en-IN")}
              <span className="text-[10px] font-normal text-white/70 ml-1.5">plus delivery</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-white/20 px-3.5 py-2 rounded-xl group-hover:bg-[#fe8357] group-hover:text-[#012d1d] transition-all">
          <span>View Bag</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </div>
      </button>
    </aside>
  );
}
