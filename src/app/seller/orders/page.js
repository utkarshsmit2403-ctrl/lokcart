"use client";

import React, { useState } from "react";
import { useSellerData } from "@/components/seller/seller-data-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Store,
  Search,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  FileText,
  User,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  Calendar,
  Sparkles
} from "lucide-react";

export default function SellerOrdersPage() {
  const { seller, orders, updateOrderStatus } = useSellerData();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [otpInput, setOtpInput] = useState({});

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.district.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAdvance = (orderId, currentStatus) => {
    const STATUS_FLOW = {
      placed: "preparing",
      preparing: "ready_for_pickup",
      ready_for_pickup: "completed",
      out_for_delivery: "completed",
    };
    const next = STATUS_FLOW[currentStatus];
    if (next) {
      updateOrderStatus(orderId, next);
    }
  };

  const handleVerifyOtp = (orderId, correctOtp) => {
    if (otpInput[orderId] === correctOtp) {
      updateOrderStatus(orderId, "completed");
      alert(`OTP verified successfully for Order #${orderId}! Order marked as Completed.`);
    } else {
      alert("Invalid OTP code. Please verify with customer or delivery executive.");
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary">Order Management</h2>
          <p className="text-xs font-medium text-brand-subtle">
            Manage live orders, verify handover OTPs, inspect order details, and print tax invoices
          </p>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <Card className="p-[16px] rounded-card border-brand-line bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-[12px]">
          {/* Tabs */}
          <div className="flex bg-muted p-1 rounded-button border border-brand-line w-full sm:w-auto overflow-x-auto custom-scrollbar">
            {[
              { key: "all", label: "All Orders" },
              { key: "placed", label: "New Placed" },
              { key: "preparing", label: "Packing" },
              { key: "ready_for_pickup", label: "Ready" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-input whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-card text-brand-primary shadow-sm"
                    : "text-brand-subtle hover:text-brand-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, name or district..."
              className="h-[38px] pl-9 bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
            />
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-[16px]">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const ModeIcon = order.fulfillmentMode === "pickup" ? Store : Truck;

          return (
            <Card key={order.id} className="p-[20px] sm:p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
              {/* Top Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] pb-3 border-b border-brand-line">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[36px] h-[36px] rounded-input bg-brand-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-xs">
                    <ModeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-sm font-extrabold text-brand-primary">Order #{order.id}</span>
                      <Badge className={`px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'placed'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20'
                      }`}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-medium text-brand-subtle mt-0.5">
                      {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-[8px]">
                  <Button
                    onClick={() => setInvoiceOrder(order)}
                    variant="outline"
                    className="h-[36px] px-3 rounded-button bg-card border-brand-line text-brand-primary hover:bg-muted text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-brand-tertiary" /> Print Invoice
                  </Button>

                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="h-[36px] px-3 rounded-button bg-muted hover:bg-card border border-brand-line text-brand-primary text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Details {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Main Summary Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1">Customer</span>
                  <p className="font-bold text-brand-primary">{order.customer.name}</p>
                  <p className="text-brand-subtle font-medium">{order.customer.district}, {order.customer.address}</p>
                  <p className="text-brand-subtle font-medium">{order.customer.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1">Fulfillment Mode</span>
                  <p className="font-bold text-brand-primary">
                    {order.fulfillmentMode === "pickup" ? "Self-Pickup from Atelier" : "Hyperlocal Direct Delivery"}
                  </p>
                  <p className="text-brand-subtle font-medium">
                    Handover OTP Code: <span className="font-mono font-bold text-brand-primary">{order.otp}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1">Payment & Payout</span>
                  <p className="text-sm font-extrabold text-brand-primary">&#8377;{order.total.toLocaleString("en-IN")}</p>
                  <Badge variant="outline" className="bg-muted border-brand-line text-brand-primary text-[10px] font-bold mt-0.5">
                    {order.paymentMethod}
                  </Badge>
                </div>
              </div>

              {/* Expanded Detailed View Section */}
              {isExpanded && (
                <div className="pt-4 border-t border-brand-line space-y-[16px] bg-muted/40 p-[16px] rounded-card animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-line">
                    <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-tertiary" /> Complete Order Details Breakdown
                    </h4>
                    <span className="text-[10px] font-bold text-brand-tertiary">ODOP Verified Order</span>
                  </div>

                  {/* Itemized Table */}
                  <div className="space-y-[8px]">
                    <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block">Ordered Items</span>
                    <div className="divide-y divide-brand-line bg-card rounded-card border border-brand-line p-3 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-brand-primary">{it.name}</p>
                            <p className="text-[11px] font-medium text-brand-subtle">SKU: {it.sku || `SKU-ITEM-0${idx + 1}`}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-brand-primary">Qty: {it.quantity}</p>
                            <p className="font-extrabold text-brand-primary">&#8377;{it.price ? it.price * it.quantity : order.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status Flow Timeline */}
                  <div className="space-y-[8px]">
                    <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block">Order Status Journey</span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className={`p-2 rounded-input border ${order.status === 'placed' ? 'bg-amber-500/10 border-amber-500 text-amber-800' : 'bg-card border-brand-line text-brand-subtle'}`}>
                        1. Placed
                      </div>
                      <div className={`p-2 rounded-input border ${order.status === 'preparing' ? 'bg-brand-tertiary/10 border-brand-tertiary text-brand-tertiary' : 'bg-card border-brand-line text-brand-subtle'}`}>
                        2. Packing
                      </div>
                      <div className={`p-2 rounded-input border ${order.status === 'ready_for_pickup' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700' : 'bg-card border-brand-line text-brand-subtle'}`}>
                        3. Ready
                      </div>
                      <div className={`p-2 rounded-input border ${order.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700' : 'bg-card border-brand-line text-brand-subtle'}`}>
                        4. Completed
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons & OTP Verification Footer */}
              <div className="pt-3 border-t border-brand-line flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
                <div className="text-xs font-bold text-brand-primary">
                  Status: <span className="uppercase text-brand-tertiary">{order.status.replace("_", " ")}</span>
                </div>

                <div className="flex items-center gap-[8px]">
                  {order.status === "placed" && (
                    <Button
                      onClick={() => handleAdvance(order.id, "placed")}
                      className="h-[38px] px-4 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      <PackageCheck className="w-4 h-4" /> Accept & Start Packing
                    </Button>
                  )}

                  {order.status === "preparing" && (
                    <Button
                      onClick={() => handleAdvance(order.id, "preparing")}
                      className="h-[38px] px-4 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-tertiary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Mark Ready for Pickup
                    </Button>
                  )}

                  {(order.status === "ready_for_pickup" || order.status === "out_for_delivery") && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        maxLength={4}
                        placeholder="Customer OTP"
                        value={otpInput[order.id] || ""}
                        onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value })}
                        className="w-28 h-[38px] bg-muted border-brand-line text-xs font-bold text-center"
                      />
                      <Button
                        onClick={() => handleVerifyOtp(order.id, order.otp)}
                        className="h-[38px] px-3.5 rounded-button bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                      >
                        Confirm Handover
                      </Button>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-pill text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Order Completed & Dispatched
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <Card className="p-[40px] text-center rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
            <Truck className="w-10 h-10 text-brand-subtle mx-auto" />
            <h3 className="text-md font-bold text-brand-primary">No orders found</h3>
            <p className="text-xs font-medium text-brand-subtle">No orders match the current filter selection.</p>
          </Card>
        )}
      </div>

      {/* PRINTABLE TAX INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-brand-primary/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-card border border-brand-line shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header Buttons */}
            <div className="flex items-center justify-between border-b border-brand-line pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-tertiary" />
                <h3 className="text-md font-bold text-brand-primary">Official Tax Invoice Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="h-[36px] px-4 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Download PDF
                </Button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1.5 text-brand-subtle hover:text-brand-primary rounded-input hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Section */}
            <div id="printable-invoice" className="space-y-6 text-brand-primary text-xs">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-brand-line pb-4">
                <div>
                  <span className="text-lg font-extrabold block text-brand-primary">{seller.name}</span>
                  <p className="text-brand-subtle font-medium">{seller.artisan} &bull; Certified Handloom Atelier</p>
                  <p className="text-brand-subtle font-medium">{seller.district}, {seller.state}, India</p>
                  <p className="text-brand-subtle font-medium">GSTIN: {seller.gstin || "10AABCS1429B1Z8"}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold uppercase text-brand-tertiary block">TAX INVOICE</span>
                  <p className="font-bold">Invoice #: INV-2026-{invoiceOrder.id}</p>
                  <p className="text-brand-subtle">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString("en-IN")}</p>
                  <p className="text-brand-subtle">ODOP ID: {seller.odopId}</p>
                </div>
              </div>

              {/* Billed To / Shipped To */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-card bg-muted border border-brand-line">
                <div>
                  <span className="font-bold uppercase text-[10px] text-brand-subtle block mb-1">Customer / Billed To</span>
                  <p className="font-bold text-sm">{invoiceOrder.customer.name}</p>
                  <p className="font-medium text-brand-subtle">{invoiceOrder.customer.address}</p>
                  <p className="font-medium text-brand-subtle">{invoiceOrder.customer.district}, India</p>
                  <p className="font-medium text-brand-subtle">Phone: {invoiceOrder.customer.phone}</p>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-brand-subtle block mb-1">Fulfillment Info</span>
                  <p className="font-bold">Mode: {invoiceOrder.fulfillmentMode === "pickup" ? "Self-Pickup" : "Hyperlocal Delivery"}</p>
                  <p className="font-medium text-brand-subtle">Payment Method: {invoiceOrder.paymentMethod}</p>
                  <p className="font-medium text-brand-subtle">Handover OTP: {invoiceOrder.otp}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse border border-brand-line">
                <thead>
                  <tr className="bg-muted text-brand-primary border-b border-brand-line font-bold text-[11px]">
                    <th className="p-2 border-r border-brand-line">#</th>
                    <th className="p-2 border-r border-brand-line">Item Description</th>
                    <th className="p-2 border-r border-brand-line text-center">Qty</th>
                    <th className="p-2 border-r border-brand-line text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {invoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-r border-brand-line font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-brand-line font-bold">{it.name}</td>
                      <td className="p-2 border-r border-brand-line text-center font-bold">{it.quantity}</td>
                      <td className="p-2 border-r border-brand-line text-right font-medium">&#8377;{it.price || invoiceOrder.total}</td>
                      <td className="p-2 text-right font-bold">&#8377;{(it.price ? it.price * it.quantity : invoiceOrder.total).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-right">
                  <div className="flex justify-between text-brand-subtle">
                    <span>Subtotal:</span>
                    <span className="font-bold text-brand-primary">&#8377;{invoiceOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-brand-subtle">
                    <span>GST (0% Pilot Scheme):</span>
                    <span className="font-bold text-brand-primary">&#8377;0</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-brand-primary border-t border-brand-line pt-2">
                    <span>Grand Total:</span>
                    <span>&#8377;{invoiceOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Stamp & Signature */}
              <div className="pt-6 border-t border-brand-line flex items-center justify-between text-[10px] text-brand-subtle">
                <div>
                  <p className="font-bold text-brand-primary">Government ODOP Handloom Guild Certified</p>
                  <p>Computer Generated Tax Invoice &bull; No Physical Signature Required</p>
                </div>
                <div className="text-right">
                  <div className="w-28 border-b border-brand-primary mb-1"></div>
                  <p className="font-bold text-brand-primary">Authorized Artisan Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
