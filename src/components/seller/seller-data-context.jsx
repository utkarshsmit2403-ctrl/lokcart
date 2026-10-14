"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  demoSeller,
  demoProducts,
  demoOrders,
  demoReturns,
  demoBankDetails,
  demoNotificationSettings,
  demoPayoutHistory,
  demoAnalytics
} from "@/lib/seller-demo-data";

const SellerDataContext = createContext(null);

export function SellerDataProvider({ children }) {
  const [seller, setSeller] = useState(demoSeller);
  const [products, setProducts] = useState(demoProducts);
  const [orders, setOrders] = useState(demoOrders);
  const [returns, setReturns] = useState(demoReturns);
  const [bankDetails, setBankDetails] = useState(demoBankDetails);
  const [notifications, setNotifications] = useState(demoNotificationSettings);
  const [payouts] = useState(demoPayoutHistory);
  const [analytics] = useState(demoAnalytics);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Fetch initial data from MongoDB API endpoints on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [prodRes, ordRes, retRes, meRes] = await Promise.all([
          fetch("/api/product"),
          fetch("/api/orders"),
          fetch("/api/returns"),
          fetch("/api/auth/me")
        ]);

        const prodData = await prodRes.json();
        if (prodData.success && prodData.products?.length > 0) {
          setProducts(prodData.products);
        }

        const ordData = await ordRes.json();
        if (ordData.success && ordData.orders?.length > 0) {
          setOrders(ordData.orders);
        }

        const retData = await retRes.json();
        if (retData.success && retData.returns?.length > 0) {
          setReturns(retData.returns);
        }

        const meData = await meRes.json();
        if (meData.success && meData.seller) {
          setSeller(meData.seller);
          setIsAuthenticated(true);
        }
        setIsDbLoaded(true);
      } catch (err) {
        console.warn("Backend API sync fallback to demo state:", err.message);
      }
    }
    loadBackendData();
  }, []);

  const addProduct = async (product) => {
    const newId = `p-${Date.now()}`;
    const formatted = {
      id: newId,
      views: 0,
      giTag: product.giTag || "Pending Review",
      odopBadge: product.odopBadge || "ODOP Certified",
      images: product.images || { primary: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" },
      variants: product.variants || [
        {
          id: `v-${newId}-1`,
          name: product.name || "Default Variant",
          color: "Standard",
          size: "Standard",
          sku: `SKU-${Date.now().toString().slice(-4)}`,
          price: product.price || 999,
          originalPrice: product.originalPrice || 1299,
          stock: product.stock || 10,
          image: product.images?.primary || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        }
      ],
      ...product,
    };

    setProducts((prev) => [formatted, ...prev]);

    // Async sync with MongoDB API
    try {
      await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted)
      });
    } catch (e) {
      console.error("Async Mongo Product Post:", e);
    }
    return formatted;
  };

  const updateProduct = async (id, patch) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
    try {
      await fetch(`/api/product?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
    } catch (e) {}
  };

  const updateVariantStock = async (productId, variantId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedVariants = (p.variants || []).map((v) =>
          v.id === variantId ? { ...v, stock: Math.max(0, parseInt(newStock) || 0) } : v
        );
        const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return { ...p, variants: updatedVariants, stock: totalStock };
      })
    );

    const target = products.find((p) => p.id === productId);
    if (target) {
      const updatedVariants = (target.variants || []).map((v) =>
        v.id === variantId ? { ...v, stock: Math.max(0, parseInt(newStock) || 0) } : v
      );
      const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
      try {
        await fetch(`/api/product?id=${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants: updatedVariants, stock: totalStock })
        });
      } catch (e) {}
    }
  };

  const removeProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/product?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const getProductById = (id) => products.find((p) => p.id === id) || null;

  const updateOrderStatus = async (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
    );
    try {
      await fetch(`/api/orders?id=${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {}
  };

  const updateReturnStatus = async (returnId, nextStatus) => {
    setReturns((prev) =>
      prev.map((ret) => (ret.id === returnId ? { ...ret, status: nextStatus } : ret))
    );
    try {
      await fetch(`/api/returns?id=${returnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {}
  };

  const updateBankDetails = (patch) => {
    setBankDetails((prev) => ({ ...prev, ...patch }));
  };

  const updateNotifications = (key, val) => {
    setNotifications((prev) => ({ ...prev, [key]: val }));
  };

  const updateSeller = (patch) => {
    setSeller((prev) => ({ ...prev, ...patch }));
  };

  const loginSeller = async (credentials) => {
    setIsAuthenticated(true);
    if (credentials?.businessName) {
      setSeller((prev) => ({ ...prev, name: credentials.businessName, phone: credentials.phone || prev.phone }));
    }
  };

  const registerSeller = async (details) => {
    setIsAuthenticated(true);
    const newSellerData = {
      id: `seller-${Date.now()}`,
      name: details.businessName || "New Artisan Atelier",
      artisan: details.artisanName || "Artisan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      banner: "https://images.unsplash.com/photo-1606744888344-49423b812d02?auto=format&fit=crop&w=1200&q=80",
      odopId: details.odopId || `ODOP-${(details.district || "IND").slice(0,3).toUpperCase()}-01`,
      giTag: "GI Tag Verification Pending",
      district: details.district || "Madhubani",
      state: details.state || "Bihar",
      badgeTier: "Registered Artisan Member",
      rating: 5.0,
      memberSince: "Just Now",
      phone: details.phone || "+91 98765 43210",
      email: details.email || "seller@lokkart.in",
      bio: "Craft artisan selling certified direct-from-artisan goods on LokKart.",
    };
    setSeller(newSellerData);

    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
    } catch (e) {}
  };

  const logoutSeller = () => {
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      seller,
      setSeller,
      updateSeller,
      products,
      addProduct,
      updateProduct,
      updateVariantStock,
      removeProduct,
      getProductById,
      orders,
      updateOrderStatus,
      returns,
      updateReturnStatus,
      bankDetails,
      updateBankDetails,
      notifications,
      updateNotifications,
      payouts,
      analytics,
      isAuthenticated,
      isDbLoaded,
      loginSeller,
      registerSeller,
      logoutSeller,
    }),
    [seller, products, orders, returns, bankDetails, notifications, payouts, analytics, isAuthenticated, isDbLoaded]
  );

  return <SellerDataContext.Provider value={value}>{children}</SellerDataContext.Provider>;
}

export function useSellerData() {
  const ctx = useContext(SellerDataContext);
  if (!ctx) {
    throw new Error("useSellerData must be used inside SellerDataProvider (see app/seller/layout.js)");
  }
  return ctx;
}