// Demo data for the LokKart Seller Panel.

export const demoSeller = {
  id: "seller-01",
  name: "Sunita Devi Crafts",
  artisan: "Master Artisan Sunita Devi",
  avatar:
    "/images/sunita-devi.jpg",
  banner:
    "/images/sunita-devi-cover.jpg",
  coverBanner:
    "/images/sunita-devi-cover.jpg",
  gallery: [
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
  ],
  odopId: "ODOP-BR-MDB-018",
  giTag: "GI Tag #428 (Mithila Art & Handloom)",
  district: "Madhubani",
  state: "Bihar",
  address: "Station Road, Old Craft Village Hub, Madhubani, Bihar - 847211",
  badgeTier: "Master Artisan Level 4 (National Awardee)",
  rating: 4.9,
  reviewsCount: 142,
  ordersCount: 342,
  viewsCount: 3820,
  monthlySales: 84250,
  verified: true,
  hyperlocalRunner: true,
  selfPickupReady: true,
  memberSince: "March 2023",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "sunita.devi@lokkart.in",
  gstin: "10AABCS1429B1Z8",
  artisanCardNo: "ART-2023-MDH-884",
  bio: "3rd-generation folk artist & master weaver preserving 400-year-old Mithila motifs using 100% natural botanical pigments and traditional pit looms. Leading a cooperative of 24 women artisans in Madhubani, Bihar.",
  story: "Our journey began in Jitwarpur village, Madhubani. Passed down through three generations of master women artisans, our handloom silk sarees and hand-drawn Mithila motifs tell stories of devotion, nature, and cultural pride. Each piece is crafted using cow-dung primed cotton, bamboo pens, and botanical dyes extracted directly from turmeric, madder roots, and indigo leaves.",
  craftProcess: [
    { title: "Bamboo Pen Sketching", desc: "Outlining ancestral Mithila motifs on pure tussar fabric using hand-carved Kachi bamboo pens." },
    { title: "Botanical Dyeing", desc: "Formulating vibrant non-toxic pigments from dried marigolds, turmeric, and indigo." },
    { title: "Pit Loom Weaving", desc: "Weaving fine mulberry silk and cotton threads on traditional wooden pit looms." }
  ],
  certifications: [
    "ODOP Registered Producer (Madhubani)",
    "GI Tag Certified #428 (Mithila Art)",
    "Government Craftmark India Verified",
    "Handloom Mark Authentic Silk Certificate"
  ],
  awards: [
    "National Craft Excellence Award (2021)",
    "State Master Weaver Fellowship (2018)"
  ]
};

export const demoProducts = [
  {
    id: "p-101",
    name: "Madhubani Silk & Cotton Saree",
    tagline: "Hand-painted lotus & peacock motif on pure silk cotton",
    category: "sarees",
    categoryLabel: "Handloom Sarees & Silk",
    price: 4500,
    originalPrice: 6700,
    discountPercent: 33,
    stock: 10,
    giTag: "GI Verified",
    odopBadge: "ODOP Certified",
    images: {
      primary:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
      ]
    },
    description:
      "Hand block-printed saree with natural dyes, woven on a traditional pit loom by the Madhubani weaving collective.",
    specs: { material: "Pure Silk Cotton & Natural Dyes", origin: "Madhubani, Bihar", weave: "Pit Loom Handloom", weight: "650g" },
    views: 1240,
    variants: [
      {
        id: "v-101-1",
        name: "White Saree (Natural Lotus White)",
        color: "White",
        colorHex: "#FFFFFF",
        size: "6.3m (with blouse piece)",
        sku: "MDB-SAR-WHT-01",
        price: 4500,
        originalPrice: 6700,
        stock: 6,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "v-101-2",
        name: "Black Saree (Midnight Obsidian)",
        color: "Black",
        colorHex: "#111111",
        size: "6.3m (with blouse piece)",
        sku: "MDB-SAR-BLK-02",
        price: 4800,
        originalPrice: 7000,
        stock: 4,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "v-101-3",
        name: "Crimson Red Saree (Mithila Royal Red)",
        color: "Red",
        colorHex: "#B3261E",
        size: "6.3m (with blouse piece)",
        sku: "MDB-SAR-RED-03",
        price: 4600,
        originalPrice: 6800,
        stock: 0,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    id: "p-102",
    name: "Sujani Embroidered Silk Dupatta",
    tagline: "Running-stitch Sujani work on tussar silk",
    category: "sarees",
    categoryLabel: "Handloom Sarees & Silk",
    price: 3200,
    originalPrice: 4300,
    discountPercent: 25,
    stock: 5,
    giTag: "GI Verified",
    odopBadge: "ODOP Certified",
    images: {
      primary:
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    },
    description: "Delicate Sujani hand-embroidery on tussar silk, sourced from the Madhubani women's cooperative.",
    specs: { material: "Tussar Silk", origin: "Madhubani, Bihar", weave: "Hand Embroidered", weight: "250g" },
    views: 860,
    variants: [
      {
        id: "v-102-1",
        name: "Golden Tussar Beige",
        color: "Beige",
        colorHex: "#F5F5DC",
        size: "2.5m",
        sku: "SUJ-DUP-BGE-01",
        price: 3200,
        originalPrice: 4300,
        stock: 5,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    id: "p-103",
    name: "Terracotta Sun Wall Plaque",
    tagline: "Sculpted clay, fired in a traditional kiln",
    category: "terracotta",
    categoryLabel: "Terracotta & Pottery",
    price: 950,
    originalPrice: 1400,
    discountPercent: 32,
    stock: 14,
    giTag: "Verified",
    odopBadge: "ODOP Certified",
    images: {
      primary:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    },
    description: "Hand-sculpted terracotta plaque, sun-dried and wood-fired using techniques passed down four generations.",
    specs: { material: "Local Clay", origin: "Madhubani, Bihar", weave: "Sculpted Terracotta", weight: "1.2kg" },
    views: 430,
    variants: [
      {
        id: "v-103-1",
        name: "Natural Earth Clay (12-inch)",
        color: "Terracotta Red",
        colorHex: "#C15C3D",
        size: "12 inch diameter",
        sku: "TRC-PLQ-12IN",
        price: 950,
        originalPrice: 1400,
        stock: 14,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    id: "p-104",
    name: "Makhana Roasted Snack Pack (250g)",
    tagline: "Farm-fresh fox nuts, roasted with rock salt",
    category: "food",
    categoryLabel: "Organic Foods & Makhana",
    price: 320,
    originalPrice: 400,
    discountPercent: 20,
    stock: 42,
    giTag: "GI Verified",
    odopBadge: "ODOP Certified",
    images: {
      primary:
        "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80",
    },
    description: "Sourced directly from Mithila-region wetland farms and roasted in small batches with no additives.",
    specs: { material: "Fox Nuts (Makhana)", origin: "Madhubani, Bihar", weave: "Artisanal Roasted", weight: "250g" },
    views: 1290,
    variants: [
      {
        id: "v-104-1",
        name: "Himalayan Pink Salt",
        color: "Original Salt",
        colorHex: "#FFFFFF",
        size: "250g Pack",
        sku: "MKH-250-SLT",
        price: 320,
        originalPrice: 400,
        stock: 25,
        image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "v-104-2",
        name: "Puri Pudina & Spices",
        color: "Mint Spice",
        colorHex: "#4CAF50",
        size: "250g Pack",
        sku: "MKH-250-PDN",
        price: 350,
        originalPrice: 420,
        stock: 17,
        image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80"
      }
    ]
  }
];

export const demoOrders = [
  {
    id: "10482",
    status: "placed",
    fulfillmentMode: "delivery",
    createdAt: "2026-09-16T08:20:00+05:30",
    otp: "4821",
    total: 4500,
    paymentMethod: "UPI (Paid)",
    customer: {
      name: "Ritika Sharma",
      phone: "+91 98765 43210",
      address: "12/4 Patliputra Colony",
      district: "Patna",
    },
    items: [{ name: "Madhubani Silk Saree (White Saree Variant)", quantity: 1, sku: "MDB-SAR-WHT-01", price: 4500 }],
  },
  {
    id: "10481",
    status: "preparing",
    fulfillmentMode: "pickup",
    createdAt: "2026-09-16T07:05:00+05:30",
    otp: "7734",
    total: 1900,
    paymentMethod: "Cash on Pickup",
    customer: {
      name: "Abhay Kumar",
      phone: "+91 91234 56780",
      address: "Ward 6, Near Bus Stand",
      district: "Madhubani",
    },
    items: [
      { name: "Terracotta Sun Wall Plaque", quantity: 2, sku: "TRC-PLQ-12IN", price: 950 },
    ],
  },
  {
    id: "10479",
    status: "ready_for_pickup",
    fulfillmentMode: "delivery",
    createdAt: "2026-09-15T18:40:00+05:30",
    otp: "1290",
    total: 640,
    paymentMethod: "UPI (Paid)",
    customer: {
      name: "Meena Devi",
      phone: "+91 99887 66554",
      address: "Sector 3, Rajendra Nagar",
      district: "Darbhanga",
    },
    items: [{ name: "Makhana Roasted Snack Pack (Himalayan Pink Salt)", quantity: 2, sku: "MKH-250-SLT", price: 320 }],
  },
  {
    id: "10475",
    status: "completed",
    fulfillmentMode: "delivery",
    createdAt: "2026-09-14T12:15:00+05:30",
    otp: "5566",
    total: 4800,
    paymentMethod: "UPI (Paid)",
    customer: {
      name: "Sandeep Yadav",
      phone: "+91 90000 11223",
      address: "Nehru Path",
      district: "Muzaffarpur",
    },
    items: [{ name: "Madhubani Silk Saree (Black Saree Variant)", quantity: 1, sku: "MDB-SAR-BLK-02", price: 4800 }],
  },
];

export const demoReturns = [
  {
    id: "RET-901",
    orderId: "10471",
    customerName: "Priyanka Rai",
    customerPhone: "+91 98112 33445",
    productName: "Madhubani Silk Saree",
    variant: "White Saree (Lotus Motif)",
    reason: "Variant / Color Mismatch",
    comments: "Ordered natural white, received slightly cream shade.",
    requestDate: "2026-09-15T10:30:00+05:30",
    status: "pending", // pending | approved | rejected | replaced | refunded
    refundAmount: 4500,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"]
  },
  {
    id: "RET-894",
    orderId: "10462",
    customerName: "Vikram Singh",
    customerPhone: "+91 97722 88119",
    productName: "Terracotta Sun Wall Plaque",
    variant: "Natural Earth Clay (12-inch)",
    reason: "Damaged in Transit",
    comments: "Hairline crack on left ray of terracotta sun plaque during shipping.",
    requestDate: "2026-09-12T14:20:00+05:30",
    status: "approved",
    refundAmount: 950,
    images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80"]
  }
];

export const demoBankDetails = {
  accountName: "Sunita Devi Crafts Collective",
  bankName: "State Bank of India",
  accountNumber: "389201948291",
  ifscCode: "SBIN0001482",
  branch: "Madhubani Main Branch, Bihar",
  upiId: "sunitadevi@sbi",
  verificationStatus: "Verified",
};

export const demoNotificationSettings = {
  smsOrders: true,
  whatsappUpdates: true,
  emailPayouts: true,
  lowStockAlerts: true,
  marketingNews: false,
};

export const demoPayoutHistory = [
  {
    id: "PAY-8821",
    date: "2026-09-15",
    amount: 14850,
    ordersCount: 4,
    status: "Settled",
    transactionId: "TXN-SBI-99182301",
    bank: "State Bank of India (***291)"
  },
  {
    id: "PAY-8750",
    date: "2026-09-08",
    amount: 22400,
    ordersCount: 6,
    status: "Settled",
    transactionId: "TXN-SBI-88129402",
    bank: "State Bank of India (***291)"
  },
  {
    id: "PAY-8690",
    date: "2026-09-01",
    amount: 18900,
    ordersCount: 5,
    status: "Settled",
    transactionId: "TXN-SBI-77182903",
    bank: "State Bank of India (***291)"
  }
];

export const demoAnalytics = {
  monthlySales: 84250,
  salesGrowthPercent: 22,
  impressions: 3820,
  geography: [
    { label: "Hyperlocal (within 10 km)", percent: 54 },
    { label: "Inter-district & state", percent: 28 },
    { label: "Pan-India & global inquiries", percent: 18 },
  ],
  revenueTrend: [
    { label: "Apr", value: 38 },
    { label: "May", value: 45 },
    { label: "Jun", value: 52 },
    { label: "Jul", value: 61 },
    { label: "Aug", value: 69 },
    { label: "Sep", value: 84 },
  ],
  payout: {
    gmv: 84250,
    commission: 0,
    commissionNote: "Hackathon pilot — direct payout",
    net: 84250,
    pending: 11200,
  },
};

export const PRODUCT_CATEGORIES = [
  { value: "sarees", label: "Handloom Sarees & Silk" },
  { value: "textiles", label: "Handcrafted Textiles & Apparel" },
  { value: "art", label: "Traditional Art & Mithila Paintings" },
  { value: "terracotta", label: "Terracotta & Pottery" },
  { value: "stonecraft", label: "Stone Carvings & Sculptures" },
  { value: "sikki", label: "Sikki Grass & Eco Crafts" },
  { value: "woodwork", label: "Carved Woodcraft & Toys" },
  { value: "metalware", label: "Brass & Bell Metal Ware" },
  { value: "leather", label: "Handcrafted Leather Goods" },
  { value: "food", label: "Organic Foods & Makhana" },
];

export const ORDER_STATUS_LABEL = {
  placed: "New order",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
};