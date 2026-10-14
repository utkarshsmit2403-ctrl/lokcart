import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Seller from "@/models/Seller";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Return from "@/models/Return";
import { INITIAL_SELLERS, INITIAL_PRODUCTS } from "@/data/mockData";
import {
  demoSeller,
  demoProducts,
  demoOrders,
  demoReturns
} from "@/lib/seller-demo-data";

export async function POST() {
  try {
    await connectToDatabase();

    // Clear existing collections
    await Seller.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Return.deleteMany({});

    // Combine Sellers (INITIAL_SELLERS from mockData.js + demoSeller)
    const filteredInitialSellers = INITIAL_SELLERS.filter((s) => s.id !== "seller-01" && s.id !== "seller-1");
    const allSellers = [
      demoSeller,
      ...filteredInitialSellers.map((s, idx) => ({
        id: s.id,
        name: s.name,
        artisan: s.artisan || s.name,
        avatar: s.avatar,
        banner: "https://images.unsplash.com/photo-1606744888344-49423b812d02?auto=format&fit=crop&w=1200&q=80",
        odopId: s.odopId || `ODOP-SLR-${idx + 2}`,
        giTag: s.giTag || "GI Verified",
        district: s.district,
        state: s.state,
        badgeTier: s.badgeTier || "Certified Master Weaver",
        rating: s.rating || 4.9,
        memberSince: "March 2023",
        phone: s.phone && s.phone !== demoSeller.phone ? s.phone : `+91 98765 432${(idx + 11).toString().padStart(2, "0")}`,
        email: s.email || `artisan${idx + 2}@lokkart.in`,
        bio: s.story || "Heritage artisan crafting direct-from-craft goods.",
      }))
    ];

    const createdSellers = await Seller.insertMany(allSellers);

    // Prepare Products with color/size variants
    const formattedMockProducts = INITIAL_PRODUCTS.map((p) => {
      const primaryImg = p.images?.primary || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
      return {
        id: p.id,
        sellerId: p.sellerId || "seller-01",
        name: p.name,
        tagline: p.tagline || "",
        category: p.category || "sarees",
        categoryLabel: p.categoryLabel || "Handloom Sarees",
        price: p.price,
        originalPrice: p.originalPrice || Math.round(p.price * 1.4),
        discountPercent: p.discountPercent || 30,
        stock: p.stock || 12,
        giTag: p.giTag || "GI Verified",
        odopBadge: p.odopBadge || "ODOP Certified",
        images: {
          primary: primaryImg,
          gallery: p.images ? Object.values(p.images).filter(url => typeof url === 'string') : []
        },
        description: p.detailedDescription || p.tagline || "",
        specs: p.specs || { material: "Pure Craft", origin: p.district || "Bihar" },
        views: p.fulfilledCount || 120,
        variants: [
          {
            id: `v-${p.id}-wht`,
            name: `${p.name} - Natural White`,
            color: "White",
            colorHex: "#FFFFFF",
            size: "Free Size (6.3m)",
            sku: `${p.id.toUpperCase()}-WHT`,
            price: p.price,
            originalPrice: p.originalPrice || Math.round(p.price * 1.4),
            stock: Math.max(2, Math.floor((p.stock || 10) / 2)),
            image: primaryImg
          },
          {
            id: `v-${p.id}-blk`,
            name: `${p.name} - Midnight Black`,
            color: "Black",
            colorHex: "#111111",
            size: "Free Size (6.3m)",
            sku: `${p.id.toUpperCase()}-BLK`,
            price: Math.round(p.price * 1.05),
            originalPrice: p.originalPrice || Math.round(p.price * 1.4),
            stock: Math.max(1, Math.floor((p.stock || 10) / 2)),
            image: primaryImg
          }
        ]
      };
    });

    const allProducts = [...demoProducts, ...formattedMockProducts];
    const createdProducts = await Product.insertMany(allProducts);

    // Insert demo orders & returns
    const createdOrders = await Order.insertMany(demoOrders);
    const createdReturns = await Return.insertMany(demoReturns);

    return NextResponse.json({
      success: true,
      message: "MongoDB Atlas successfully populated with 6 Sellers, 17 Products, and full Color/Size Variants!",
      counts: {
        sellers: createdSellers.length,
        products: createdProducts.length,
        orders: createdOrders.length,
        returns: createdReturns.length,
      },
    });
  } catch (err) {
    console.error("Database seed error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
