"use client";

import React from "react";
import Link from "next/link";
import { useSellerData } from "@/components/seller/seller-data-context";
import SellerChatbot from "@/components/seller/SellerChatbot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function SellerDashboardPage() {
  const { seller, products, orders, returns, analytics, updateOrderStatus } = useSellerData();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "placed" || o.status === "preparing");
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const pendingReturns = returns.filter((r) => r.status === "pending");

  return (
    <div className="space-y-[24px]">
      {/* Top Banner Alert for low stock or returns */}
      {(lowStockProducts.length > 0 || pendingReturns.length > 0) && (
        <div className="p-[16px] rounded-card bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <span className="p-2 rounded-full bg-amber-500/20 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-brand-primary">Action Required</h4>
              <p className="text-xs font-medium text-brand-subtle">
                {lowStockProducts.length} craft items are running low on stock &bull; {pendingReturns.length} customer return requests pending.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            {lowStockProducts.length > 0 && (
              <Link
                href="/seller/inventory"
                className="h-[36px] px-3 rounded-button bg-card border border-brand-line text-brand-primary font-bold text-xs shadow-sm hover:bg-muted transition-transform active:scale-[0.98] flex items-center gap-1.5"
              >
                Update Stock
              </Link>
            )}
            {pendingReturns.length > 0 && (
              <Link
                href="/seller/returns"
                className="h-[36px] px-3 rounded-button bg-amber-600 text-white font-bold text-xs shadow-sm hover:bg-amber-700 transition-transform active:scale-[0.98] flex items-center gap-1.5"
              >
                Review Returns
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">Total Sales</span>
            <span className="p-2 rounded-full bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-brand-primary">
            &#8377;{totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] font-medium text-brand-subtle flex items-center gap-1">
            <span className="text-emerald-600 font-bold">+{analytics.salesGrowthPercent}%</span> vs last month
          </p>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">Active Orders</span>
            <span className="p-2 rounded-full bg-brand-tertiary/10 text-brand-tertiary">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-brand-primary">
            {pendingOrders.length}
          </div>
          <p className="text-[11px] font-medium text-brand-subtle">
            {orders.filter((o) => o.status === "placed").length} new order(s) awaiting preparation
          </p>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">Craft Products</span>
            <span className="p-2 rounded-full bg-indigo-500/10 text-indigo-600">
              <PackageCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-brand-primary">
            {products.length}
          </div>
          <p className="text-[11px] font-medium text-brand-subtle">
            {products.reduce((acc, p) => acc + (p.variants?.length || 1), 0)} active variants listed
          </p>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">ODOP Pilot Tier</span>
            <span className="p-2 rounded-full bg-amber-500/10 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-md font-extrabold text-brand-primary truncate">
            {seller.badgeTier}
          </div>
          <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider w-fit">
            0% Commission Active
          </Badge>
        </Card>
      </div>

      {/* Top Variant Stock Highlight */}
      <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
        <div className="flex items-center justify-between pb-3 border-b border-brand-line">
          <div>
            <h3 className="text-md font-bold text-brand-primary">Top Performing Variant Inventory</h3>
            <p className="text-xs font-medium text-brand-subtle">Real-time stock status across color variations like White Saree vs Black Saree</p>
          </div>
          <Link
            href="/seller/inventory"
            className="text-xs font-bold text-brand-tertiary hover:underline flex items-center gap-1"
          >
            Manage All Inventory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          {products[0]?.variants?.slice(0, 3).map((v) => (
            <div key={v.id} className="p-[16px] rounded-card bg-muted border border-brand-line flex items-center gap-[12px]">
              <img src={v.image || products[0].images.primary} alt={v.name} className="w-[48px] h-[48px] rounded-input object-cover border border-brand-line" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-brand-primary truncate">{v.name}</h4>
                <p className="text-[11px] font-medium text-brand-subtle">SKU: {v.sku}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-extrabold text-brand-primary">&#8377;{v.price}</span>
                  <Badge className={`px-2 py-0.5 rounded-pill text-[9px] font-bold uppercase tracking-wider ${v.stock > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                    {v.stock > 0 ? `${v.stock} in stock` : "Out of Stock"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Orders Section */}
      <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
        <div className="flex items-center justify-between pb-3 border-b border-brand-line">
          <div>
            <h3 className="text-md font-bold text-brand-primary">Recent Orders</h3>
            <p className="text-xs font-medium text-brand-subtle">Latest customer orders waiting for dispatch</p>
          </div>
          <Link href="/seller/orders" className="text-xs font-bold text-brand-tertiary hover:underline flex items-center gap-1">
            View All Orders ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-brand-line custom-scrollbar">
          {orders.slice(0, 4).map((order) => (
            <div key={order.id} className="py-[14px] flex flex-col md:flex-row md:items-center justify-between gap-[12px]">
              <div className="space-y-1">
                <div className="flex items-center gap-[8px]">
                  <span className="text-xs font-extrabold text-brand-primary">Order #{order.id}</span>
                  <Badge className={`px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${order.status === 'placed' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20'}`}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-brand-subtle">
                  Customer: <strong className="text-brand-primary font-bold">{order.customer.name}</strong> ({order.customer.district}) &bull; Total: <strong className="text-brand-primary font-bold">&#8377;{order.total}</strong>
                </p>
                <p className="text-[11px] font-medium text-brand-subtle">
                  Item: {order.items[0]?.name}
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {order.status === "placed" && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                    className="h-[36px] px-3.5 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98]"
                  >
                    Accept & Prepare
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, "ready_for_pickup")}
                    className="h-[36px] px-3.5 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-tertiary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98]"
                  >
                    Mark Ready for Pickup
                  </Button>
                )}
                <Link
                  href="/seller/orders"
                  className="h-[36px] px-3 rounded-button bg-muted border border-brand-line text-brand-primary text-xs font-bold hover:bg-card transition-transform active:scale-[0.98] flex items-center gap-1"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* Seller Chatbot */}
      <SellerChatbot seller={seller} orders={orders} returns={returns} analytics={analytics} />
    </div>
  );
}