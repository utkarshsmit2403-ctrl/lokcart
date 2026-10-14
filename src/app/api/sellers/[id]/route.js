import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Seller from "@/models/Seller";
import Product from "@/models/Product";
import { demoSeller, demoProducts } from "@/lib/seller-demo-data";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const targetId = id === "seller-01" ? ["seller-01", "seller-1"] : id === "seller-1" ? ["seller-1", "seller-01"] : [id];

    let dbSeller = await Seller.findOne({ id: { $in: targetId } }).lean();
    
    // Merge DB seller with demoSeller fallbacks to guarantee high resolution images & rich craft metadata
    const seller = dbSeller
      ? {
          ...demoSeller,
          ...dbSeller,
          avatar: (dbSeller.avatar && dbSeller.avatar.startsWith("/images/")) ? dbSeller.avatar : demoSeller.avatar,
          banner: (dbSeller.banner && dbSeller.banner.startsWith("/images/")) ? dbSeller.banner : demoSeller.banner,
          coverBanner: (dbSeller.coverBanner && dbSeller.coverBanner.startsWith("/images/")) ? dbSeller.coverBanner : demoSeller.coverBanner,
          gallery: (dbSeller.gallery && dbSeller.gallery.length > 0) ? dbSeller.gallery : demoSeller.gallery,
          story: dbSeller.story || dbSeller.bio || demoSeller.story,
          bio: dbSeller.bio || dbSeller.story || demoSeller.bio,
          craftProcess: (dbSeller.craftProcess && dbSeller.craftProcess.length > 0) ? dbSeller.craftProcess : demoSeller.craftProcess,
          certifications: (dbSeller.certifications && dbSeller.certifications.length > 0) ? dbSeller.certifications : demoSeller.certifications,
          awards: (dbSeller.awards && dbSeller.awards.length > 0) ? dbSeller.awards : demoSeller.awards,
          whatsapp: dbSeller.whatsapp || dbSeller.phone || demoSeller.whatsapp,
        }
      : demoSeller;

    let products = await Product.find({
      $or: [
        { sellerId: { $in: targetId } },
        { sellerId: seller.id },
        { sellerName: seller.name }
      ]
    }).lean();

    if (!products || products.length === 0) {
      products = demoProducts;
    }

    const categoryBreakdown = Array.from(
      products.reduce((map, p) => {
        const cat = p.categoryLabel || p.category || "handcrafts";
        map.set(cat, (map.get(cat) || 0) + 1);
        return map;
      }, new Map())
    ).map(([category, count]) => ({ category, count }));

    return NextResponse.json({
      success: true,
      seller,
      products,
      productCount: products.length,
      categoryBreakdown,
    });
  } catch (err) {
    console.error("GET Seller by ID Error:", err);
    return NextResponse.json({
      success: true,
      seller: demoSeller,
      products: demoProducts,
      productCount: demoProducts.length,
      categoryBreakdown: [],
    });
  }
}
