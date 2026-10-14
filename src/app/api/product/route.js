import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { productSchema } from "@/lib/validators";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (id) {
      const product = await Product.findOne({ id });
      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    let filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { "variants.name": { $regex: search, $options: "i" } },
        { "variants.sku": { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("GET Products Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Zod Validation
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    await connectToDatabase();

    const newId = body.id || `p-${Date.now()}`;
    const newProduct = await Product.create({
      id: newId,
      sellerId: body.sellerId || "seller-01",
      name: data.name,
      tagline: data.tagline || "",
      category: data.category,
      categoryLabel: data.categoryLabel || "Handloom Sarees",
      price: data.price,
      originalPrice: data.originalPrice || Math.round(data.price * 1.3),
      discountPercent: Math.round(
        (((data.originalPrice || data.price * 1.3) - data.price) /
          (data.originalPrice || data.price * 1.3)) *
          100
      ),
      stock: data.stock,
      giTag: data.giTag || "GI Verified",
      odopBadge: data.odopBadge || "ODOP Certified",
      images: data.images,
      description: data.description || "",
      specs: data.specs || { material: "Pure Craft", origin: "Bihar" },
      variants: data.variants && data.variants.length > 0 ? data.variants : [
        {
          id: `v-${newId}-1`,
          name: `${data.name} - Standard`,
          color: "Standard",
          size: "Standard",
          sku: `SKU-${Date.now().toString().slice(-4)}`,
          price: data.price,
          originalPrice: data.originalPrice || Math.round(data.price * 1.3),
          stock: data.stock,
          image: data.images.primary,
        }
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully in MongoDB",
      product: newProduct,
    }, { status: 201 });
  } catch (err) {
    console.error("POST Product Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    const targetId = id || body.id;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "Product ID required for update" }, { status: 400 });
    }

    const updated = await Product.findOneAndUpdate({ id: targetId }, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully in MongoDB",
      product: updated,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required for deletion" }, { status: 400 });
    }

    const deleted = await Product.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully from MongoDB`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
