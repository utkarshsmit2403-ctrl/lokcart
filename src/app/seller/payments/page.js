"use client";

import React from "react";
import Link from "next/link";
import { useSellerData } from "@/components/seller/seller-data-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Clock,
  ArrowUpRight,
  HelpCircle
} from "lucide-react";

export default function SellerPaymentsPage() {
  const { bankDetails, payouts, analytics } = useSellerData();

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary">Payments & Payouts</h2>
          <p className="text-xs font-medium text-brand-subtle">
            Direct bank settlements, 0% platform commission pilot, and payout history log
          </p>
        </div>
        <Link
          href="/seller/settings"
          className="h-[40px] px-4 rounded-button bg-card border border-brand-line text-brand-primary font-bold text-xs shadow-sm hover:bg-muted transition-transform active:scale-[0.98] flex items-center gap-1.5 w-fit"
        >
          <Building2 className="w-4 h-4 text-brand-tertiary" /> Bank Account Settings
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">Gross Sales Value</span>
          <div className="text-2xl font-extrabold text-brand-primary">&#8377;{analytics.monthlySales.toLocaleString("en-IN")}</div>
          <p className="text-[11px] font-medium text-brand-subtle flex items-center gap-1">
            <span className="text-emerald-600 font-bold">+{analytics.salesGrowthPercent}%</span> monthly growth
          </p>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">Platform Commission</span>
          <div className="text-2xl font-extrabold text-emerald-600">&#8377;0 (0%)</div>
          <p className="text-[11px] font-medium text-brand-subtle">
            {analytics.payout.commissionNote}
          </p>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[8px]">
          <span className="text-xs font-bold text-brand-subtle uppercase tracking-wider">Pending Settlement</span>
          <div className="text-2xl font-extrabold text-brand-primary">&#8377;{analytics.payout.pending.toLocaleString("en-IN")}</div>
          <p className="text-[11px] font-medium text-brand-subtle flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Next payout: Tuesday, 10 AM
          </p>
        </Card>
      </div>

      {/* Linked Bank Card */}
      <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
        <div className="flex items-center justify-between pb-3 border-b border-brand-line">
          <div>
            <h3 className="text-md font-bold text-brand-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-tertiary" /> Linked Payout Bank Account
            </h3>
            <p className="text-xs font-medium text-brand-subtle">Primary bank destination for direct settlements</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {bankDetails.verificationStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] text-xs">
          <div>
            <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1">Account Holder</span>
            <p className="font-bold text-brand-primary">{bankDetails.accountName}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1">Bank & Branch</span>
            <p className="font-bold text-brand-primary">{bankDetails.bankName}</p>
            <p className="text-brand-subtle font-medium">{bankDetails.branch}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider block mb-1">Account & IFSC</span>
            <p className="font-bold text-brand-primary">Acc: {bankDetails.accountNumber}</p>
            <p className="text-brand-subtle font-medium">IFSC: {bankDetails.ifscCode}</p>
          </div>
        </div>
      </Card>

      {/* Payout History Log */}
      <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
        <div className="pb-3 border-b border-brand-line">
          <h3 className="text-md font-bold text-brand-primary">Settlement History Log</h3>
          <p className="text-xs font-medium text-brand-subtle">Recent bank transfer payouts</p>
        </div>

        <div className="divide-y divide-brand-line custom-scrollbar">
          {payouts.map((log) => (
            <div key={log.id} className="py-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
              <div className="space-y-1">
                <div className="flex items-center gap-[8px]">
                  <span className="text-xs font-extrabold text-brand-primary">{log.id}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
                    {log.status}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-brand-subtle">
                  Date: {log.date} &bull; Orders fulfilled: {log.ordersCount} &bull; Ref: {log.transactionId}
                </p>
              </div>

              <div className="flex items-center gap-[12px]">
                <span className="text-md font-extrabold text-brand-primary">&#8377;{log.amount.toLocaleString("en-IN")}</span>
                <button
                  type="button"
                  onClick={() => alert(`Downloaded receipt for ${log.id}`)}
                  className="p-1.5 text-brand-subtle hover:text-brand-primary rounded-input hover:bg-muted transition-colors"
                  title="Download Receipt"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
