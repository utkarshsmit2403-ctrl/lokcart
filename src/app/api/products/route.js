import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { INITIAL_PRODUCTS } from "@/data/mockData";

const KNOWN_COORDINATES = {
  gaya: { lat: 24.7955, lng: 85.0002 },
  patna: { lat: 25.5941, lng: 85.1376 },
  aurangabad: { lat: 24.7538, lng: 84.3739 },
  madhubani: { lat: 26.3542, lng: 86.0719 },
  bhagalpur: { lat: 25.2425, lng: 86.9842 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  gorakhpur: { lat: 26.7606, lng: 83.3732 },
  saharanpur: { lat: 29.9671, lng: 77.5510 },
  channapatna: { lat: 12.6518, lng: 77.2089 },
  delhi: { lat: 28.6139, lng: 77.2090 }
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.5;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const districtParam = searchParams.get("district") || searchParams.get("originDistrict") || "";
    const userDistrict = searchParams.get("userDistrict") || "";
    const category = searchParams.get("category") || "all";
    const odopOnly = searchParams.get("odopOnly") === "true";
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.toLowerCase().trim();
    const sort = searchParams.get("sort") || "nearest";
    const radius = searchParams.get("radius") || "all";

    // User coordinates (from GPS or city/district default)
    let userLat = parseFloat(searchParams.get("userLat"));
    let userLng = parseFloat(searchParams.get("userLng"));

    // If coordinates missing but userDistrict provided, use known district coordinates
    if ((isNaN(userLat) || isNaN(userLng)) && userDistrict) {
      const uKey = userDistrict.toLowerCase().trim();
      if (KNOWN_COORDINATES[uKey]) {
        userLat = KNOWN_COORDINATES[uKey].lat;
        userLng = KNOWN_COORDINATES[uKey].lng;
      }
    }

    let baseProducts = [];
    try {
      await connectToDatabase();
      const dbProducts = await Product.find({}).lean();
      if (dbProducts && dbProducts.length > 0) {
        baseProducts = dbProducts.map((p) => {
          const distName = p.district || p.location?.district || p.specs?.origin?.split(",")?.[0]?.trim() || "Madhubani";
          const dKey = distName.toLowerCase();
          const fallbackCoords = KNOWN_COORDINATES[dKey] || KNOWN_COORDINATES.madhubani;
          
          const pLat = p.location?.lat || fallbackCoords.lat;
          const pLng = p.location?.lng || fallbackCoords.lng;

          return {
            ...p,
            district: distName,
            state: p.state || p.location?.state || "Bihar",
            sellerName: p.sellerName || "Artisan Guild Partner",
            rating: p.rating || 4.8,
            isOdop: p.isOdop !== undefined ? p.isOdop : true,
            location: {
              lat: pLat,
              lng: pLng,
              district: distName,
              state: p.state || "Bihar",
              address: p.location?.address || `${distName} Artisan Cluster`,
            },
          };
        });
      }
    } catch (err) {
      console.warn("Products API MongoDB fetch fallback:", err.message);
    }

    if (baseProducts.length === 0) {
      baseProducts = INITIAL_PRODUCTS.map(p => ({
        ...p,
        district: p.district || "Madhubani",
        state: p.state || "Bihar",
        location: {
          lat: KNOWN_COORDINATES[p.district?.toLowerCase()]?.lat || 26.3542,
          lng: KNOWN_COORDINATES[p.district?.toLowerCase()]?.lng || 86.0719,
          district: p.district || "Madhubani",
          state: p.state || "Bihar",
        }
      }));
    }

    // Calculate dynamic distance for each product
    let list = baseProducts.map((p) => {
      let dist = p.distanceKm || 3.5;
      if (!isNaN(userLat) && !isNaN(userLng)) {
        const pLat = p.location?.lat || KNOWN_COORDINATES[p.district?.toLowerCase()]?.lat;
        const pLng = p.location?.lng || KNOWN_COORDINATES[p.district?.toLowerCase()]?.lng;
        if (pLat && pLng) {
          dist = calculateDistanceKm(userLat, userLng, pLat, pLng);
        }
      }

      // Check if hyperlocal delivery is applicable (< 30km or same district)
      const sameDistrict = userDistrict && p.district?.toLowerCase() === userDistrict.toLowerCase();
      const isHyperlocalEligible = dist <= 30 || sameDistrict;

      return {
        ...p,
        distanceKm: Math.max(0.8, dist),
        isHyperlocal: isHyperlocalEligible,
      };
    });

    // 1. Filter by District / Origin District
    if (districtParam && districtParam !== "all") {
      const targetDist = districtParam.toLowerCase().trim();
      list = list.filter((p) => {
        const prodDist = (p.district || p.location?.district || "").toLowerCase();
        return prodDist.includes(targetDist) || targetDist.includes(prodDist);
      });
    }

    // 2. Filter by Radius / Hyperlocal scope
    if (radius === "district" || radius === "hyperlocal") {
      list = list.filter((p) => {
        const sameDist = userDistrict && (
          (p.district || "").toLowerCase() === userDistrict.toLowerCase() ||
          (p.location?.district || "").toLowerCase() === userDistrict.toLowerCase()
        );
        const within15km = (p.distanceKm || 999) <= 25;
        return sameDist || within15km;
      });
    } else if (radius === "50km") {
      list = list.filter((p) => (p.distanceKm || 999) <= 50);
    } else if (radius === "100km") {
      list = list.filter((p) => (p.distanceKm || 999) <= 100);
    }

    // 3. Filter by Category
    if (category && category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    // 4. Filter by ODOP Only
    if (odopOnly) {
      list = list.filter((p) => p.isOdop);
    }

    // 5. Filter by Search keyword
    if (search) {
      list = list.filter((p) => {
        return (
          p.name?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.district?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search) ||
          p.sellerName?.toLowerCase().includes(search)
        );
      });
    }

    // 6. Sort Logic (Nearest First, Price Asc, Price Desc, Rating)
    if (sort === "nearest") {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (sort === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default to nearest first
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      userLocationUsed: !isNaN(userLat) && !isNaN(userLng) ? { lat: userLat, lng: userLng, userDistrict } : null,
      products: list,
    });
  } catch (err) {
    console.error("GET /api/products Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const distName = body.district || "Gaya";
    const dKey = distName.toLowerCase();
    const coords = KNOWN_COORDINATES[dKey] || { lat: 24.7955, lng: 85.0002 };

    const newProduct = await Product.create({
      id: body.id || `prod-${Date.now()}`,
      name: body.name,
      category: body.category || "sarees",
      price: Number(body.price),
      originalPrice: Number(body.originalPrice) || Number(body.price) * 1.3,
      stock: Number(body.stock) || 10,
      description: body.description || "",
      district: distName,
      state: body.state || "Bihar",
      sellerName: body.sellerName || "Artisan Guild Partner",
      location: {
        lat: coords.lat,
        lng: coords.lng,
        district: distName,
        state: body.state || "Bihar",
        address: body.address || `${distName} Artisan Workshop`,
      },
      images: {
        primary: body.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85",
        gallery: [body.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"],
      },
      ...body
    });
    
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}