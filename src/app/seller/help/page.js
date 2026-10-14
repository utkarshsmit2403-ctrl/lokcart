"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  BookOpen,
  PhoneCall,
  ShieldCheck,
  Send,
  CheckCircle2,
  Package,
  MessageSquare
} from "lucide-react";

export default function SellerHelpPage() {
  const [ticket, setTicket] = useState({ subject: "", message: "", category: "odop" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicket({ subject: "", message: "", category: "odop" });
      alert("Support ticket submitted! Your District Handloom Officer has been notified.");
    }, 1000);
  };

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary">Artisan Guild Help & Support</h2>
          <p className="text-xs font-medium text-brand-subtle">
            ODOP certification guidelines, packaging standards, and direct district officer support
          </p>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
          <div className="p-2.5 rounded-full bg-brand-tertiary/10 text-brand-tertiary w-fit">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-primary">ODOP Certification Handbook</h3>
          <p className="text-xs font-medium text-brand-subtle">
            Learn how to apply for official GI-tag badges and government artisan subsidy programs.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Opening ODOP Certification Guide PDF..."); }} className="text-xs font-bold text-brand-tertiary hover:underline block">
            Read Guide &rarr;
          </a>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
          <div className="p-2.5 rounded-full bg-indigo-500/10 text-indigo-600 w-fit">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-primary">Safe Craft Packaging Standards</h3>
          <p className="text-xs font-medium text-brand-subtle">
            Best practices for bubble-wrapping terracotta pottery and handloom silk box packaging.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Opening Packaging Standards PDF..."); }} className="text-xs font-bold text-brand-tertiary hover:underline block">
            View Instructions &rarr;
          </a>
        </Card>

        <Card className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
          <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 w-fit">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-primary">District Officer Directory</h3>
          <p className="text-xs font-medium text-brand-subtle">
            Direct phone numbers for Madhubani, Bhagalpur, Patna & Varanasi handicraft nodal officers.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("District Officer Directory: Madhubani Nodal Officer: +91 612 2219482"); }} className="text-xs font-bold text-brand-tertiary hover:underline block">
            View Contacts &rarr;
          </a>
        </Card>
      </div>

      {/* FAQs */}
      <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
        <h3 className="text-md font-bold text-brand-primary pb-3 border-b border-brand-line">
          Frequently Asked Questions
        </h3>

        <div className="space-y-[14px]">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-brand-primary">Q: How do weekly payouts work for sales?</h4>
            <p className="text-xs font-medium text-brand-subtle leading-relaxed">
              All settled orders are processed every Tuesday morning directly into your verified bank account via NEFT/UPI with 0% platform commission.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-brand-primary">Q: How do I manage variant stock like White Saree vs Black Saree?</h4>
            <p className="text-xs font-medium text-brand-subtle leading-relaxed">
              In your Inventory tab, click on the &ldquo;Variants&rdquo; dropdown under any product listing to set individual stock counts and prices for each color option.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-brand-primary">Q: What should I do if a customer requests a return due to Transit Damage?</h4>
            <p className="text-xs font-medium text-brand-subtle leading-relaxed">
              Check the photo evidence provided by the customer in your Returns tab. Once approved, LokKart logistics will collect the item and process a replacement dispatch.
            </p>
          </div>
        </div>
      </Card>

      {/* Submit Support Ticket Form */}
      <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
        <h3 className="text-md font-bold text-brand-primary pb-3 border-b border-brand-line flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-tertiary" /> Raise Support Ticket to Nodal Office
        </h3>

        <form onSubmit={handleSubmitTicket} className="space-y-[14px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Issue Category</label>
              <select
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                className="w-full h-[44px] px-3 bg-muted border border-brand-line rounded-input text-xs font-bold text-brand-primary"
              >
                <option value="odop">ODOP & GI Certification Issue</option>
                <option value="payment">Payout & Bank Settlement Query</option>
                <option value="logistics">Courier Pickup & Dispatch Support</option>
                <option value="technical">App & Inventory Tech Assistance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Ticket Subject *</label>
              <Input
                required
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                placeholder="Brief summary of your query..."
                className="h-[44px] bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">Detailed Message *</label>
            <textarea
              required
              rows={3}
              value={ticket.message}
              onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
              placeholder="Describe your issue in detail..."
              className="w-full p-3 bg-muted border border-brand-line rounded-input text-xs font-bold text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary"
            />
          </div>

          <Button
            type="submit"
            disabled={submitted}
            className="h-[44px] px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Submit Support Ticket
          </Button>
        </form>
      </Card>
    </div>
  );
}
