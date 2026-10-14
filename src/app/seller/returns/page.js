"use client";

import React, { useState } from "react";
import { useSellerData } from "@/components/seller/seller-data-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  User,
  Image as ImageIcon,
  ArrowRight
} from "lucide-react";

export default function SellerReturnsPage() {
  const { returns, updateReturnStatus } = useSellerData();
  const [activeTab, setActiveTab] = useState("all");

  const filteredReturns = returns.filter((ret) => {
    if (activeTab === "all") return true;
    return ret.status === activeTab;
  });

  return (
    <div className="space-y-[24px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary">Returns & Replacements</h2>
          <p className="text-xs font-medium text-brand-subtle">
            Manage customer return claims, inspect reported defect images, and issue refunds or replacements
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-[16px] rounded-card border-brand-line bg-card shadow-sm">
        <div className="flex bg-muted p-1 rounded-button border border-brand-line w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {[
            { key: "all", label: "All Returns" },
            { key: "pending", label: "Pending Review" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-input whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "bg-card text-brand-primary shadow-sm"
                  : "text-brand-subtle hover:text-brand-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Returns List */}
      <div className="space-y-[16px]">
        {filteredReturns.map((item) => (
          <Card key={item.id} className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
            {/* Return Claim Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-line gap-[8px]">
              <div className="flex items-center gap-[12px]">
                <h3 className="text-md font-bold text-brand-primary">Claim #{item.id}</h3>
                <span className="text-xs font-medium text-brand-subtle">Linked Order #{item.orderId}</span>
                <Badge className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                  {item.status}
                </Badge>
              </div>

              <span className="text-xs font-extrabold text-brand-primary">
                Refund Amount: &#8377;{item.refundAmount}
              </span>
            </div>

            {/* Claim Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">Customer Info</span>
                <p className="font-bold text-brand-primary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-tertiary" /> {item.customerName}
                </p>
                <p className="text-brand-subtle font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {item.customerPhone}
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">Product & Variant</span>
                <p className="font-bold text-brand-primary">{item.productName}</p>
                <p className="text-brand-subtle font-medium">Variant: {item.variant}</p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">Return Reason</span>
                <Badge variant="outline" className="bg-muted border-brand-line text-brand-primary text-[10px] font-bold block w-fit">
                  {item.reason}
                </Badge>
                <p className="text-brand-subtle font-medium italic mt-1">&ldquo;{item.comments}&rdquo;</p>
              </div>
            </div>

            {/* Customer Photo Evidence */}
            {item.images && item.images.length > 0 && (
              <div className="pt-2 border-t border-brand-line">
                <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Customer Photo Evidence
                </span>
                <div className="flex gap-2">
                  {item.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Evidence" className="w-16 h-16 rounded-input object-cover border border-brand-line" />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-brand-line flex items-center justify-end gap-[8px]">
              {item.status === "pending" && (
                <>
                  <Button
                    onClick={() => updateReturnStatus(item.id, "rejected")}
                    variant="outline"
                    className="h-[40px] px-4 rounded-button bg-card border-brand-line text-destructive hover:bg-destructive/10 font-bold text-xs shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    Reject Claim
                  </Button>
                  <Button
                    onClick={() => updateReturnStatus(item.id, "approved")}
                    className="h-[40px] px-4 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    Approve Return & Refund
                  </Button>
                </>
              )}

              {item.status === "approved" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-pill text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Return Approved & Refund Initiated
                </Badge>
              )}

              {item.status === "rejected" && (
                <Badge className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-pill text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Claim Rejected
                </Badge>
              )}
            </div>
          </Card>
        ))}

        {filteredReturns.length === 0 && (
          <Card className="p-[40px] text-center rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
            <RotateCcw className="w-10 h-10 text-brand-subtle mx-auto" />
            <h3 className="text-md font-bold text-brand-primary">No return claims</h3>
            <p className="text-xs font-medium text-brand-subtle">No return requests match the selected status.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
