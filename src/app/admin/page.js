"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

export default function AdminPage() {
  const {
    verifications,
    approveVerification,
    rejectVerification,
    orders,
    products,
    districts,
  } = useStore();

  const [activeSection, setActiveSection] = useState("overview"); // "overview" | "verifications" | "odop" | "orders"

  const totalGMV = orders.reduce((acc, o) => acc + o.total, 0) + 1420000;
  const pendingKycCount = verifications.filter((v) => v.status === "pending").length;

  return (
    <div className="min-h-screen flex bg-[#f2fcf5] text-[#151d1a]">
      {/* ADMIN SIDEBAR */}
      <aside className="w-72 bg-[#012d1d] text-white hidden md:flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo & Portal Info */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-[#c85a32] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            </div>
            <div>
              <span className="text-lg font-extrabold text-white block tracking-tight">LokKart Admin</span>
              <span className="text-[10px] text-[#86af99] font-bold uppercase tracking-wider">ODOP Governance Deck</span>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActiveSection("overview")}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all text-left cursor-pointer ${
                activeSection === "overview"
                  ? "bg-[#1b4332] text-white shadow-xs"
                  : "text-[#c1ecd4] hover:bg-[#1b4332]/50"
              }`}
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>Platform KPIs &amp; Pulse</span>
            </button>

            <button
              onClick={() => setActiveSection("verifications")}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all text-left cursor-pointer ${
                activeSection === "verifications"
                  ? "bg-[#1b4332] text-white shadow-xs"
                  : "text-[#c1ecd4] hover:bg-[#1b4332]/50"
              }`}
            >
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>Seller KYC Approvals</span>
              {pendingKycCount > 0 && (
                <span className="ml-auto bg-[#c85a32] text-white text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                  {pendingKycCount} New
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection("odop")}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all text-left cursor-pointer ${
                activeSection === "odop"
                  ? "bg-[#1b4332] text-white shadow-xs"
                  : "text-[#c1ecd4] hover:bg-[#1b4332]/50"
              }`}
            >
              <span className="material-symbols-outlined text-base">map</span>
              <span>ODOP Registry Hub</span>
            </button>

            <button
              onClick={() => setActiveSection("orders")}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all text-left cursor-pointer ${
                activeSection === "orders"
                  ? "bg-[#1b4332] text-white shadow-xs"
                  : "text-[#c1ecd4] hover:bg-[#1b4332]/50"
              }`}
            >
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span>Fulfillment SLA Monitor</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#1b4332] text-xs text-[#86af99]">
          <Link href="/" className="block py-1 hover:text-white font-semibold">
            ← Back to Storefront
          </Link>
          <div className="text-[10px]">Ministry of Textiles &amp; ODOP Pilot</div>
        </div>
      </aside>

      {/* MAIN ADMIN CANVAS */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#c1c8c2] sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h1 className="text-xl font-extrabold text-[#012d1d]">
              National Platform Moderation Deck
            </h1>
            <p className="text-xs text-[#414844]">
              Real-time governance, seller authentication, and ODOP district metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#ecf6f0] border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]">
              Pilot Phase: <strong>Bihar &amp; Uttar Pradesh</strong>
            </span>
          </div>
        </header>

        {/* SECTION 1: OVERVIEW & KPIS */}
        {activeSection === "overview" && (
          <div className="p-6 md:p-8 space-y-8 max-w-6xl">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2] shadow-xs">
                <span className="text-[11px] font-bold text-[#717973] uppercase block">Platform GMV Volume</span>
                <div className="text-2xl font-extrabold text-[#012d1d] mt-1">₹{(totalGMV / 100000).toFixed(2)} Lakhs</div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
                  Direct artisan payout flow
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2] shadow-xs">
                <span className="text-[11px] font-bold text-[#717973] uppercase block">Verified Artisans</span>
                <div className="text-2xl font-extrabold text-[#012d1d] mt-1">1,240 Makers</div>
                <span className="text-[11px] text-[#1b4332] font-semibold mt-1 inline-block">
                  Across 6 states
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2] shadow-xs">
                <span className="text-[11px] font-bold text-[#717973] uppercase block">Active ODOP Districts</span>
                <div className="text-2xl font-extrabold text-[#c85a32] mt-1">{districts.length} Pilot Hubs</div>
                <span className="text-[11px] text-[#414844] font-semibold mt-1 inline-block">
                  100% GI Mapping
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2] shadow-xs">
                <span className="text-[11px] font-bold text-[#717973] uppercase block">Pending Verifications</span>
                <div className="text-2xl font-extrabold text-[#012d1d] mt-1">{pendingKycCount} Requests</div>
                <span className="text-[11px] text-[#c85a32] font-semibold mt-1 inline-block">
                  Awaiting audit
                </span>
              </div>
            </div>

            {/* Quick Action: Pending Verification Requests */}
            <div className="bg-white rounded-3xl border border-[#c1c8c2] shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#012d1d] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c85a32]">verified_user</span>
                    Pending Artisan KYC Verifications ({pendingKycCount})
                  </h3>
                  <p className="text-xs text-[#414844] mt-0.5">
                    Review and grant Verified Master Artisan badges for official ODOP listings.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection("verifications")}
                  className="text-xs text-[#c85a32] font-bold hover:underline"
                >
                  View Queue →
                </button>
              </div>

              <div className="space-y-3">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl border border-[#c1c8c2]/70 bg-[#f2fcf5] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#012d1d] text-sm">{v.businessName}</span>
                        <span className="text-[10px] font-bold bg-[#ffdbcf] text-[#a23e18] px-2 py-0.2 rounded">
                          {v.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#414844] mt-0.5">
                        Maker: <strong>{v.artisanName}</strong> • {v.district}, {v.state} ({v.category})
                      </p>
                      <p className="text-[#717973] mt-0.5">
                        GI Certificate: <span className="font-mono font-bold text-[#012d1d]">{v.giCertificateNumber}</span> • {v.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {v.status === "pending" ? (
                        <>
                          <button
                            onClick={() => approveVerification(v.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#1b4332] text-white font-bold hover:bg-[#012d1d] transition-colors cursor-pointer"
                          >
                            Approve Artisan
                          </button>
                          <button
                            onClick={() => rejectVerification(v.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#ba1a1a] text-[#ba1a1a] font-bold hover:bg-[#ffdad6] transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-[#c1ecd4] px-3 py-1 rounded-xl">
                          ✓ Verified &amp; Badge Awarded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Recent Orders Activity */}
            <div className="bg-white rounded-3xl border border-[#c1c8c2] shadow-xs p-6">
              <h3 className="text-base font-extrabold text-[#012d1d] mb-4">
                Recent Orders Monitored across Districts
              </h3>
              <div className="divide-y divide-[#c1c8c2]/40 text-xs">
                {orders.map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#012d1d]">#{o.id}</span> • <span>{o.customer.name}</span> ({o.customer.district})
                      <div className="text-[11px] text-[#717973]">
                        {o.fulfillmentMode === "pickup" ? "Self-Pickup" : "Hyperlocal Runner"} • {o.items.length} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-[#012d1d]">₹{o.total}</div>
                      <span className="text-[10px] font-bold text-[#1b4332] uppercase">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: VERIFICATIONS QUEUE */}
        {activeSection === "verifications" && (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-extrabold text-[#012d1d]">Seller Verification &amp; KYC Queue</h2>
              <p className="text-xs text-[#414844]">Inspect GI registry paperwork and award authentic maker seals.</p>
            </div>

            <div className="space-y-4">
              {verifications.map((v) => (
                <div key={v.id} className="bg-white p-6 rounded-3xl border border-[#c1c8c2] shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#c1c8c2]/50">
                    <div>
                      <h3 className="text-base font-bold text-[#012d1d]">{v.businessName}</h3>
                      <p className="text-[#414844]">Lead Artisan: {v.artisanName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                      v.status === "approved" ? "bg-[#c1ecd4] text-[#012d1d]" : "bg-[#ffdbcf] text-[#a23e18]"
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#ecf6f0] rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#717973]">District Registry</span>
                      <p className="font-bold text-[#012d1d]">{v.district}, {v.state}</p>
                    </div>

                    <div className="p-3 bg-[#ecf6f0] rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#717973]">GI Certificate</span>
                      <p className="font-mono font-bold text-[#012d1d]">{v.giCertificateNumber}</p>
                    </div>

                    <div className="p-3 bg-[#ecf6f0] rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#717973]">Aadhaar / Udyam</span>
                      <p className="font-bold text-emerald-700">✓ Biometric Authenticated</p>
                    </div>
                  </div>

                  <p className="text-[#414844] italic">“{v.notes}”</p>

                  <div className="pt-2 flex justify-end gap-2">
                    {v.status === "pending" ? (
                      <>
                        <button
                          onClick={() => approveVerification(v.id)}
                          className="px-4 py-2 rounded-xl bg-[#1b4332] text-white font-bold hover:bg-[#012d1d]"
                        >
                          Approve &amp; Grant Verified Badge
                        </button>
                        <button
                          onClick={() => rejectVerification(v.id)}
                          className="px-4 py-2 rounded-xl border border-[#ba1a1a] text-[#ba1a1a] font-bold hover:bg-[#ffdad6]"
                        >
                          Request Re-Audit
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-800 font-bold bg-[#c1ecd4] px-4 py-1.5 rounded-xl">
                        ✓ Active Verified Maker
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: ODOP REGISTRY HUB */}
        {activeSection === "odop" && (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-extrabold text-[#012d1d]">ODOP District Master Directory</h2>
              <p className="text-xs text-[#414844]">Manage government-designated specialties for each district.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {districts.map((d) => (
                <div key={d.id} className="bg-white p-5 rounded-3xl border border-[#c1c8c2] shadow-xs flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#c85a32] uppercase">{d.badge}</span>
                    <h3 className="text-base font-bold text-[#012d1d] mt-0.5">{d.name}, {d.state}</h3>
                    <p className="text-[#414844] mt-1">{d.activeOdop}</p>
                    <p className="text-[#717973] text-[11px]">{d.artisanCount} Active Guild Members</p>
                  </div>

                  <Link
                    href={`/explore?district=${d.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#ecf6f0] text-[#012d1d] font-bold hover:bg-[#1b4332] hover:text-white transition-colors"
                  >
                    View Catalog →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: FULFILLMENT SLA MONITOR */}
        {activeSection === "orders" && (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-extrabold text-[#012d1d]">Fulfillment &amp; SLA Monitor</h2>
              <p className="text-xs text-[#414844]">Ensure 3-hour runner SLAs and 2-hour self-pickup readiness.</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#c1c8c2] p-6 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between font-bold text-[#012d1d]">
                <span>Self-Pickup SLA Compliance</span>
                <span className="text-emerald-700">98.4% (Avg 42 mins prep)</span>
              </div>
              <div className="w-full h-2.5 bg-[#ecf6f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#1b4332] rounded-full" style={{ width: "98%" }}></div>
              </div>

              <div className="flex items-center justify-between font-bold text-[#012d1d] pt-2">
                <span>Hyperlocal 3-Hour Delivery SLA</span>
                <span className="text-emerald-700">96.8% (Avg 1 hr 45 mins delivery)</span>
              </div>
              <div className="w-full h-2.5 bg-[#ecf6f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#c85a32] rounded-full" style={{ width: "96%" }}></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
