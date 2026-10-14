import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS } from "@/data/mockData";

// Presentation metadata only (icon key + accent + short subtitle).
// Everything countable (counts, price range, districts, subcategories,
// banner image) is computed live from INITIAL_PRODUCTS below, so this
// stays in sync with mock data automatically instead of being hardcoded.
const CATEGORY_META = {
  sarees: {
    label: "Handloom Sarees & Textiles",
    subtitle: "Tussar, Banarasi & Khadi weaves",
    icon: "Shirt",
    accent: "#0050ff",
  },
  food: {
    label: "Organic Foods & ODOP Agro",
    subtitle: "Makhana, honey & regional foods",
    icon: "Leaf",
    accent: "#16a34a",
  },
  terracotta: {
    label: "Terracotta & Pottery",
    subtitle: "Black clay craft & sculptures",
    icon: "Flower2",
    accent: "#b45309",
  },
  woodwork: {
    label: "Woodcraft & Lacquer Toys",
    subtitle: "Carved Sheesham & lacquer art",
    icon: "Gamepad2",
    accent: "#7c3aed",
  },
};

function fallbackMeta(slug) {
  return {
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
    subtitle: "Regional ODOP craft",
    icon: "Store",
    accent: "#282c3f",
  };
}

export async function GET() {
  const groups = new Map();

  for (const p of INITIAL_PRODUCTS) {
    const slug = p.category;
    if (!slug) continue;
    if (!groups.has(slug)) {
      groups.set(slug, {
        products: [],
        districts: new Set(),
        subcategories: new Set(),
      });
    }
    const g = groups.get(slug);
    g.products.push(p);
    if (p.district) g.districts.add(p.district);
    if (p.categoryLabel) g.subcategories.add(p.categoryLabel);
  }

  const categories = Array.from(groups.entries()).map(([slug, g]) => {
    const meta = CATEGORY_META[slug] || fallbackMeta(slug);
    const prices = g.products.map((p) => p.price).filter((n) => typeof n === "number");
    const odopCount = g.products.filter((p) => p.isOdop).length;
    const bannerImage =
      g.products.find((p) => p.featured)?.images?.primary ||
      g.products[0]?.images?.primary ||
      null;

    return {
      slug,
      label: meta.label,
      subtitle: meta.subtitle,
      icon: meta.icon,
      accent: meta.accent,
      productCount: g.products.length,
      odopCount,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      districts: Array.from(g.districts),
      subcategories: Array.from(g.subcategories),
      bannerImage,
    };
  });

  // Stable, deterministic ordering: largest catalog first.
  categories.sort((a, b) => b.productCount - a.productCount);

  return NextResponse.json({ success: true, count: categories.length, categories });
}
