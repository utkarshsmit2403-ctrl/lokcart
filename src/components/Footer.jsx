"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone } from "lucide-react";

// Social glyphs defined as inline SVGs since lucide-react no longer ships brand icons.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 9H15V6.5h-1.75C11.1 6.5 10 7.6 10 9.75V11H8.5v2.5H10V21h2.5v-7.5H14l.5-2.5h-2v-1c0-.63.13-1 .5-1Z" />
    </svg>
  );
}
function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 4l7.2 8.6L4.3 20H6l5.9-6.3L16.6 20H20l-7.5-9L19.4 4H17.7l-5.4 5.8L8.4 4H4Z" />
    </svg>
  );
}
function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

const craftBelts = [
  { label: "Bhagalpur", href: "/explore?originDistrict=Bhagalpur" },
  { label: "Madhubani", href: "/explore?originDistrict=Madhubani" },
  { label: "Varanasi", href: "/explore?originDistrict=Varanasi" },
  { label: "Gorakhpur", href: "/explore?originDistrict=Gorakhpur" },
  { label: "Saharanpur", href: "/explore?originDistrict=Saharanpur" },
  { label: "Channapatna", href: "/explore?originDistrict=Channapatna" },
];

const quickLinks = [
  { label: "ODOP Craft", href: "/explore" },
  { label: "Near Me", href: "/explore?radius=10km" },
  { label: "Artisan Clusters", href: "/#areas" },
  { label: "Seller Hub", href: "/seller" },
  { label: "Checkout", href: "/checkout" },
];

const accountLinks = [
  { label: "Login / Register", href: "/login" },
  { label: "Your Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Track Package", href: "/track" },
  { label: "Help Center", href: "/help" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "X (Twitter)", href: "#", icon: XIcon },
  { label: "YouTube", href: "#", icon: YoutubeIcon },
  { label: "WhatsApp", href: "#", icon: WhatsappIcon },
];

export default function Footer() {
  return (
    <footer
      className="bg-primary text-brand-subtle antialiased border-t border-brand-line/20"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[48px] px-4 sm:px-6 lg:px-8 py-[64px] lg:gap-[64px]">
        
        <div className="grid grid-cols-1 items-start gap-[48px] text-center lg:grid-cols-5 lg:gap-[24px] lg:text-left">
          
          {/* Brand + Contact */}
          <div className="flex w-full flex-col items-center gap-[24px] pr-0 lg:col-span-2 lg:items-start lg:pr-[48px]">
            <Link href="/" aria-label="Go to homepage" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="Lokart Logo"
                width={48}
                height={48}
                className="h-[48px] w-[48px] rounded-md object-contain border border-brand-line/20 bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col leading-none text-left">
                <span className="text-[24px] font-extrabold text-secondary-foreground tracking-tight">
                  Lokart
                </span>
                <span className="text-[10px] text-secondary-foreground/70 font-bold uppercase tracking-widest mt-1.5">
                  ODOP Quick-Commerce
                </span>
              </div>
            </Link>

            <div className="flex flex-col gap-3 text-center lg:text-left mt-2 w-full">
              <a
                href="#"
                className="text-sm font-medium hover:text-secondary-foreground transition-colors duration-200 flex items-center gap-2.5 justify-center lg:justify-start"
              >
                <MapPin className="w-4 h-4 shrink-0 text-secondary-foreground/50" />
                Gaya, Bihar - 823001
              </a>
              <a
                href="mailto:support@lokkart.in"
                className="text-sm font-medium hover:text-secondary-foreground transition-colors duration-200 flex items-center gap-2.5 justify-center lg:justify-start"
              >
                <Mail className="w-4 h-4 shrink-0 text-secondary-foreground/50" />
                support@lokkart.in
              </a>
              <a
                href="tel:+919110155364"
                className="text-sm font-medium hover:text-secondary-foreground transition-colors duration-200 flex items-center gap-2.5 justify-center lg:justify-start"
              >
                <Phone className="w-4 h-4 shrink-0 text-secondary-foreground/50" />
                +91 9110155364
              </a>
            </div>

            <div className="flex justify-center lg:justify-start gap-3 mt-3" aria-label="Social media links">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Follow us on ${label}`}
                  className="transition-all duration-200 text-brand-subtle hover:text-secondary-foreground bg-brand-line/10 hover:bg-brand-line/30 p-2.5 rounded-full border border-brand-line/10"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Heritage Belts */}
          <div className="flex flex-col gap-[20px]">
            <h2 className="text-sm font-bold text-secondary-foreground uppercase tracking-widest">Heritage Belts</h2>
            <nav className="flex flex-col gap-[14px]" aria-label="Heritage artisan belts">
              {craftBelts.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium hover:text-secondary-foreground hover:translate-x-1 transition-all duration-200 inline-block w-max mx-auto lg:mx-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-[20px]">
            <h2 className="text-sm font-bold text-secondary-foreground uppercase tracking-widest">Quick Links</h2>
            <nav className="flex flex-col gap-[14px]" aria-label="Quick links">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium hover:text-secondary-foreground hover:translate-x-1 transition-all duration-200 inline-block w-max mx-auto lg:mx-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-[20px]">
            <h2 className="text-sm font-bold text-secondary-foreground uppercase tracking-widest">Account</h2>
            <nav className="flex flex-col gap-[14px]" aria-label="Account links">
              {accountLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium hover:text-secondary-foreground hover:translate-x-1 transition-all duration-200 inline-block w-max mx-auto lg:mx-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="bg-brand-line/20" />

        {/* Bottom Legal / Copyright Section */}
        <div className="flex flex-col gap-[24px] text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p className="text-xs font-medium order-2 lg:order-1 text-secondary-foreground/60">
            © {new Date().getFullYear()} Lokart ODOP Commerce. All rights reserved.
          </p>
          <nav
            className="order-1 flex flex-wrap justify-center items-center gap-[20px] lg:order-2 lg:justify-end text-xs font-medium"
            aria-label="Legal links"
          >
            {legalLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-secondary-foreground transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}