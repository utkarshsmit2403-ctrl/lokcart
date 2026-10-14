import Script from "next/script";
import "./globals.css";
import localFont from "next/font/local"; 
import { StoreProvider } from "@/context/StoreContext";
import DistrictModal from "@/components/DistrictModal";
import CartDrawer from "@/components/CartDrawer";
import QuickCartBar from "@/components/QuickCartBar";

// Configure the local Gilroy fonts based on your directory
const gilroy = localFont({
  src: [
    {
      path: "../../public/fonts/Gilroy-Medium-Rupee.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-SemiBold-Rupee.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-Bold-Rupee.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-ExtraBold-Rupee.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

export const metadata = {
  title: "LokKart — Local Products. Global Possibilities. (ODOP Direct)",
  description:
    "Hyperlocal to Global E-Commerce Marketplace connecting Indian local artisans, ODOP craftsmen, and customers with self-pickup, 3-hour local delivery, and global freight.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`h-full scroll-smooth ${gilroy.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-full flex flex-col text-[#151d1a] antialiased selection:bg-[#fe8357] selection:text-white">
        <StoreProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <DistrictModal />
          <CartDrawer />
          <QuickCartBar />
        </StoreProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}