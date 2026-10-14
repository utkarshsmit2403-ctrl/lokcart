import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { orderSchema } from "@/lib/validators";
import { getAuthSeller } from "@/lib/auth";

const DEFAULT_CRAFT_IMAGES = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606744888344-493238955de0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80",
];

// Helper to construct complete milestone timeline
function buildOrderTimeline(order) {
  if (Array.isArray(order?.timeline) && order.timeline.length > 0) {
    return order.timeline;
  }

  const createdTime = order?.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "Confirmed";

  const status = (order?.status || "placed").toLowerCase();
  const isPickup = order?.fulfillmentMode === "pickup";

  const isPreparing = ["preparing", "processing", "ready_for_pickup", "out_for_delivery", "completed", "delivered"].includes(status);
  const isDispatchedOrReady = ["ready_for_pickup", "out_for_delivery", "completed", "delivered"].includes(status);
  const isCompleted = ["completed", "delivered"].includes(status);

  if (isPickup) {
    return [
      {
        label: "Order Placed & Confirmed",
        timestamp: createdTime,
        done: true,
      },
      {
        label: "Artisan Preparing Craft Items",
        timestamp: isPreparing ? "In Progress" : "Pending",
        done: isPreparing,
      },
      {
        label: "Ready at Artisan Atelier for Pickup",
        timestamp: isDispatchedOrReady ? "Ready for Pickup" : "Pending",
        done: isDispatchedOrReady,
      },
      {
        label: "Order Collected (Handover Complete)",
        timestamp: isCompleted ? "Collected" : "Pending Pickup",
        done: isCompleted,
      },
    ];
  }

  return [
    {
      label: "Order Placed & Confirmed",
      timestamp: createdTime,
      done: true,
    },
    {
      label: "Artisan Preparing Craft Items",
      timestamp: isPreparing ? "In Progress" : "Pending",
      done: isPreparing,
    },
    {
      label: "Out for Hyperlocal Delivery",
      timestamp: isDispatchedOrReady ? "Active Dispatch" : "Expected soon",
      done: isDispatchedOrReady,
    },
    {
      label: "Handover Completed (OTP Verified)",
      timestamp: isCompleted ? "Delivered" : "Security Code Required",
      done: isCompleted,
    },
  ];
}

// Helper to enrich order object with timeline, item images and fallbacks
function enrichOrder(order, productMap = {}) {
  const plain = order.toObject ? order.toObject() : { ...order };
  
  // Format items with fallback images & seller names
  const items = (plain.items || []).map((item, idx) => {
    let img = item.image;
    if (!img) {
      if (item.productId && productMap[item.productId]) {
        img = productMap[item.productId];
      } else {
        img = DEFAULT_CRAFT_IMAGES[idx % DEFAULT_CRAFT_IMAGES.length];
      }
    }
    return {
      ...item,
      image: img,
      sellerName: item.sellerName || "Artisan Guild Partner",
      price: item.price || 0,
      quantity: item.quantity || 1,
    };
  });

  const timeline = buildOrderTimeline(plain);
  const fulfillmentFee = plain.fulfillmentFee !== undefined
    ? plain.fulfillmentFee
    : (plain.fulfillmentMode === "pickup" ? 0 : 49);

  const subtotal = plain.subtotal || plain.total || (
    items.reduce((acc, it) => acc + (it.price * it.quantity), 0)
  );

  return {
    ...plain,
    id: String(plain.id),
    items,
    timeline,
    subtotal,
    fulfillmentFee,
    total: plain.total || subtotal + fulfillmentFee,
    runnerName: plain.runnerName || "LokKart Local Express Runner",
    pickupLocation: plain.pickupLocation || `${plain.customer?.district || "Gaya"} Master Craft Atelier`,
    customer: {
      name: plain.customer?.name || "Valued Patron",
      phone: plain.customer?.phone || "+91 98765 43210",
      address: plain.customer?.address || "Address details on file",
      district: plain.customer?.district || "Gaya",
      state: plain.customer?.state || "Bihar",
      pincode: plain.customer?.pincode || plain.customer?.pinCode || "823001",
    },
  };
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const phoneQuery = searchParams.get("phone");
    const sellerIdQuery = searchParams.get("sellerId");
    const auth = getAuthSeller(request);

    // Build product map for item images
    let productMap = {};
    try {
      const products = await Product.find({}, { id: 1, "images.primary": 1 }).lean();
      products.forEach((p) => {
        if (p.id && p.images?.primary) {
          productMap[p.id] = p.images.primary;
        }
      });
    } catch (e) {
      // Non-fatal if product lookup fails
    }

    // 1. DIRECT ORDER LOOKUP BY ID (Does NOT require auth if order ID is provided)
    if (id) {
      let order = await Order.findOne({ id: id.trim() }).lean();
      
      // Fallback: check if id is a MongoDB ObjectId
      if (!order && mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id).lean();
      }

      // Fallback: case-insensitive regex lookup
      if (!order) {
        order = await Order.findOne({ id: { $regex: `^${id.trim()}$`, $options: "i" } }).lean();
      }

      if (!order) {
        return NextResponse.json(
          { success: false, error: `Order #${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        order: enrichOrder(order, productMap),
      });
    }

    // 2. LIST ORDERS WITH USER-CENTRIC FILTERING (Show ONLY the user's orders)
    let filter = {};

    const effectiveSellerId = sellerIdQuery || auth?.sellerId;
    const effectivePhone = phoneQuery || auth?.phone;
    const effectiveUserId = searchParams.get("userId") || auth?.userId;
    const effectiveEmail = searchParams.get("email") || auth?.email;

    if (effectiveSellerId) {
      // Seller view: show ONLY orders received by this seller
      filter.sellerId = effectiveSellerId;
    } else if (effectivePhone || effectiveUserId || effectiveEmail) {
      // Customer view: show ONLY orders placed by this specific user
      const userConditions = [];
      if (effectivePhone) {
        const cleanDigits = effectivePhone.replace(/\D/g, "");
        if (cleanDigits.length >= 7) {
          const flexiblePattern = cleanDigits.slice(-10).split("").join("\\D*");
          userConditions.push({ "customer.phone": { $regex: flexiblePattern } });
        }
        userConditions.push({ "customer.phone": effectivePhone });
      }
      if (effectiveUserId) {
        userConditions.push({ "customer.userId": effectiveUserId });
        userConditions.push({ userId: effectiveUserId });
      }
      if (effectiveEmail) {
        userConditions.push({ "customer.email": effectiveEmail });
      }
      filter.$or = userConditions;
    } else {
      // Unauthenticated guest user without phone or session:
      // Return empty array so customer order history NEVER leaks random strangers' orders
      return NextResponse.json({
        success: true,
        count: 0,
        orders: [],
      });
    }

    // Filter by status if specified
    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const enrichedOrders = orders.map((o) => enrichOrder(o, productMap));

    return NextResponse.json({
      success: true,
      count: enrichedOrders.length,
      orders: enrichedOrders,
    });
  } catch (err) {
    console.error("GET /api/orders Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid order data" },
        { status: 400 }
      );
    }

    const data = validation.data;
    await connectToDatabase();

    const orderId = body.id || `LK-${Math.floor(10000 + Math.random() * 90000)}`;
    const otpCode = body.otp || Math.floor(1000 + Math.random() * 9000).toString();

    // Initial timeline
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const isPickup = data.fulfillmentMode === "pickup";
    const initialTimeline = isPickup
      ? [
          { label: "Order Placed & Confirmed", timestamp: nowTime, done: true },
          { label: "Artisan Preparing Craft Items", timestamp: "In Progress", done: true },
          { label: "Ready at Artisan Atelier for Pickup", timestamp: "Expected in 1-2 hrs", done: false },
          { label: "Order Collected (Handover Complete)", timestamp: "Pending Pickup", done: false },
        ]
      : [
          { label: "Order Placed & Confirmed", timestamp: nowTime, done: true },
          { label: "Artisan Preparing Craft Items", timestamp: "In Progress", done: true },
          { label: "Out for Hyperlocal Delivery", timestamp: "Expected in 2-3 hrs", done: false },
          { label: "Handover Completed (OTP Verified)", timestamp: "Security Code Required", done: false },
        ];

    const newOrder = await Order.create({
      id: orderId,
      userId: body.userId || body.customer?.userId || "usr-1789754768128",
      sellerId: body.sellerId || "seller-01",
      status: body.status || "placed",
      fulfillmentMode: data.fulfillmentMode,
      otp: otpCode,
      total: data.total,
      subtotal: data.subtotal || data.total,
      fulfillmentFee: data.fulfillmentFee || (isPickup ? 0 : 49),
      paymentMethod: data.paymentMethod || "UPI (Paid)",
      paymentStatus: body.paymentStatus || "paid",
      razorpayOrderId: body.razorpayOrderId || null,
      razorpayPaymentId: body.razorpayPaymentId || null,
      customer: data.customer,
      items: data.items,
      timeline: body.timeline || initialTimeline,
      runnerName: body.runnerName || "LokKart Local Express Runner",
      pickupLocation: body.pickupLocation || `${data.customer.district || "Gaya"} Master Craft Workshop`,
    });

    const enriched = enrichOrder(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: enriched,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/orders Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: "Order ID required for update" },
        { status: 400 }
      );
    }

    const existing = await Order.findOne({ id: targetId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Order #${targetId} not found` },
        { status: 404 }
      );
    }

    // If status updated, synchronize timeline
    if (body.status && body.status !== existing.status) {
      const updatedTimeline = buildOrderTimeline({
        ...existing.toObject(),
        status: body.status,
      });
      body.timeline = updatedTimeline;
    }

    const updated = await Order.findOneAndUpdate(
      { id: targetId },
      { $set: body },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Order updated successfully in MongoDB",
      order: enrichOrder(updated),
    });
  } catch (err) {
    console.error("PUT /api/orders Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Order.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Order #${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order #${id} deleted successfully`,
    });
  } catch (err) {
    console.error("DELETE /api/orders Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
