import SellerLayoutWrapper from "@/components/seller/seller-layout-wrapper";

export const metadata = {
  title: "Seller Panel — LokKart Artisan Guild",
};

export default function SellerLayout({ children }) {
  return <SellerLayoutWrapper>{children}</SellerLayoutWrapper>;
}