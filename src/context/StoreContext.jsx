"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// mockData imports removed - we now fetch from functional backend API

const StoreContext = createContext(null);

const KNOWN_COORDINATES = {
  madhubani: { lat: 26.3542, lng: 86.0719 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  bhagalpur: { lat: 25.2425, lng: 86.9842 },
  gorakhpur: { lat: 26.7606, lng: 83.3732 },
  saharanpur: { lat: 29.9671, lng: 77.5510 },
  channapatna: { lat: 12.6518, lng: 77.2089 },
  gaya: { lat: 24.7955, lng: 85.0002 },
  aurangabad: { lat: 24.7538, lng: 84.3739 },
  patna: { lat: 25.5941, lng: 85.1376 },
  delhi: { lat: 28.6139, lng: 77.2090 }
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 4.5;
  const R = 6371;
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

function readLocationCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)lokkart_user_location=([^;]+)/);
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function writeLocationCookie(loc) {
  if (typeof document === "undefined") return;
  if (!loc) {
    document.cookie = "lokkart_user_location=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax";
    return;
  }
  const date = new Date();
  date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
  document.cookie = `lokkart_user_location=${encodeURIComponent(JSON.stringify(loc))};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

export function StoreProvider({ children }) {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lokkart_selected_district");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [radiusFilter, setRadiusFilter] = useState("all");
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [originDistrictFilter, setOriginDistrictFilter] = useState("all");

  // User authentication state (Flipkart-style customer account)
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lokkart_user");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const login = (userData) => {
    const fullUser = {
      id: userData?.id,
      name: userData?.name,
      phone: userData?.phone,
      email: userData?.email,
      city: userData?.city || userLocation?.city,
      pincode: userData?.pincode || userLocation?.pincode,
      state: userData?.state || userLocation?.state,
      avatar: userData?.avatar,
      isLoggedIn: true
    };
    setUser(fullUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("lokkart_user", JSON.stringify(fullUser));
    }
    setIsLoginModalOpen(false);
    return fullUser;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lokkart_user");
    }
  };

  // Sync authenticated user from /api/auth/me
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const fullUser = {
            ...data.user,
            isLoggedIn: true
          };
          setUser(fullUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("lokkart_user", JSON.stringify(fullUser));
          }
          return fullUser;
        }
      }
    } catch (e) {
      console.error("Failed to sync /api/auth/me", e);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // User location state: strictly from localStorage or cookie, NO hardcoded demo location!
  const [userLocation, setUserLocation] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lokkart_user_location");
        if (saved) return JSON.parse(saved);
        const cookieLoc = readLocationCookie();
        if (cookieLoc) return cookieLoc;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Ask user for location if none has been set yet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lokkart_user_location") || readLocationCookie();
      if (!saved) {
        const timer = setTimeout(() => {
          setIsDistrictModalOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Save location to localStorage & cookie
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (userLocation) {
        try {
          localStorage.setItem("lokkart_user_location", JSON.stringify(userLocation));
          writeLocationCookie(userLocation);
        } catch (e) {
          console.error(e);
        }
      } else {
        localStorage.removeItem("lokkart_user_location");
        writeLocationCookie(null);
      }
    }
  }, [userLocation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedDistrict) {
        localStorage.setItem("lokkart_selected_district", JSON.stringify(selectedDistrict));
      } else {
        localStorage.removeItem("lokkart_selected_district");
      }
    }
  }, [selectedDistrict]);

  // Orders fetched from API
  const [orders, setOrders] = useState([]);

  // Verifications fetched from API
  const [verifications, setVerifications] = useState([]);

  // Fetch initial base data (districts, sellers, orders, verifications)
  useEffect(() => {
    async function loadBaseData() {
      try {
        const [distRes, sellRes, ordRes, verRes] = await Promise.all([
          fetch("/api/districts"),
          fetch("/api/sellers"),
          fetch("/api/orders"),
          fetch("/api/verifications")
        ]);
        if (distRes.ok) {
          const d = await distRes.json();
          if (d.success) setDistricts(d.districts || []);
        }
        if (sellRes.ok) {
          const s = await sellRes.json();
          if (s.success) setSellers(s.sellers || []);
        }
        if (ordRes.ok) {
          const o = await ordRes.json();
          if (o.success) setOrders(o.orders || []);
        }
        if (verRes.ok) {
          const v = await verRes.json();
          if (v.success) setVerifications(v.verifications || []);
        }
      } catch (err) {
        console.error("Failed to load base data", err);
      }
    }
    loadBaseData();
  }, []);

  // Clear saved location
  const clearLocation = () => {
    setUserLocation(null);
    setSelectedDistrict(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lokkart_user_location");
      localStorage.removeItem("lokkart_selected_district");
      writeLocationCookie(null);
    }
    fetchProductsFromApi({ radius: "all" });
  };

  // Resolve user's own district from delivery location
  const getUserOwnDistrict = useCallback(() => {
    if (!userLocation?.city) return null;
    const city = userLocation.city.toLowerCase();
    const matched = districts.find(
      (d) =>
        d.name.toLowerCase() === city ||
        city.includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(city)
    );
    return matched ? matched.name : userLocation.city;
  }, [userLocation, districts]);

  // Fetch products from API /api/products with query parameters
  const fetchProductsFromApi = useCallback(async (params = {}) => {
    setProductsLoading(true);
    try {
      const query = new URLSearchParams();

      const ownDistrict = getUserOwnDistrict();
      let originDist = params.originDistrict !== undefined ? params.originDistrict : originDistrictFilter;

      if (originDist) {
        query.set("originDistrict", originDist);
      } else if (params.radius === "district" && (params.district || selectedDistrict?.name)) {
        query.set("district", params.district || selectedDistrict.name);
        if (params.state || selectedDistrict?.state) {
          query.set("state", params.state || selectedDistrict.state);
        }
      } else if (params.districtExplicit) {
        query.set("district", params.districtExplicit);
      }

      if (ownDistrict) {
        query.set("userDistrict", ownDistrict);
      }

      if (params.radius) query.set("radius", params.radius);
      if (params.category && params.category !== "all") query.set("category", params.category);
      if (params.odopOnly) query.set("odopOnly", "true");
      if (params.search) query.set("search", params.search);
      if (params.sort) query.set("sort", params.sort);

      const coords = params.coordinates || userLocation?.coordinates;
      if (coords?.lat && coords?.lng) {
        query.set("userLat", coords.lat);
        query.set("userLng", coords.lng);
      }

      const res = await fetch(`/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }
    } catch (e) {
      console.error("Failed to fetch products from /api/products", e);
    } finally {
      setTimeout(() => {
        setProductsLoading(false);
      }, 300);
    }
  }, [selectedDistrict, userLocation, originDistrictFilter, getUserOwnDistrict]);

  // Trigger product fetch when location, origin district, or filters change
  useEffect(() => {
    fetchProductsFromApi({
      originDistrict: originDistrictFilter,
      coordinates: userLocation?.coordinates,
      radius: radiusFilter,
      category: categoryFilter,
      search: searchQuery
    });
  }, [originDistrictFilter, userLocation?.coordinates, radiusFilter, categoryFilter, searchQuery, fetchProductsFromApi]);

  // OpenStreetMap Nominatim: Search by Area, Street, City or PIN Code
  const searchAddressNominatim = async (queryText) => {
    if (!queryText || queryText.trim().length < 2) return [];
    try {
      const encoded = encodeURIComponent(queryText.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&countrycodes=in`,
        { headers: { "Accept-Language": "en", "User-Agent": "LokKart-ODOP-Commerce/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return [];
    } catch (e) {
      console.error("Nominatim search error", e);
      return [];
    }
  };

  // Select location from Nominatim Search Result
  // Select location from Nominatim Search Result (Customer Delivery Destination)
  const selectLocationFromNominatim = (item) => {
    if (!item) return;
    const addr = item.address || {};
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const coords = { lat, lng };

    const detectedCity =
      addr.city ||
      addr.town ||
      addr.state_district ||
      addr.county ||
      addr.suburb ||
      item.name ||
      "Delivery Hub";

    const detectedState = addr.state || "India";
    const detectedPin = addr.postcode || "";
    const detectedBlock = addr.suburb || addr.neighbourhood || addr.road || detectedCity;

    const newLoc = {
      pincode: detectedPin || (userLocation?.pincode || ""),
      city: detectedCity,
      block: detectedBlock || detectedCity,
      state: detectedState,
      isGps: false,
      coordinates: coords,
      formatted: `${detectedCity}, ${detectedState} ${detectedPin ? `(${detectedPin})` : ""}`
    };

    setUserLocation(newLoc);
    setLocationError(null);
    setIsDistrictModalOpen(false);

    // Re-fetch products to calculate transit distances relative to this new delivery address
    fetchProductsFromApi({
      coordinates: coords,
      originDistrict: originDistrictFilter !== "all" ? originDistrictFilter : undefined
    });
  };

  // Pincode lookup powered 100% by OpenStreetMap Nominatim
  const fetchLocationByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return { success: false, error: "Please enter a valid 6-digit PIN code" };
    }
    setLocationLoading(true);
    setLocationError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=in&format=json&addressdetails=1&limit=1`,
        { headers: { "Accept-Language": "en", "User-Agent": "LokKart-ODOP-Commerce/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const addr = item.address || {};
          const detectedCity =
            addr.state_district ||
            addr.city ||
            addr.town ||
            addr.county ||
            addr.district ||
            "Local District";
          const detectedState = addr.state || "India";
          const detectedBlock =
            addr.suburb || addr.neighbourhood || addr.road || addr.county || detectedCity;
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const coords = { lat, lng };

          let matched = districts.find(
            (d) =>
              d.name.toLowerCase() === detectedCity.toLowerCase() ||
              d.name.toLowerCase().includes(detectedCity.toLowerCase()) ||
              detectedCity.toLowerCase().includes(d.name.toLowerCase())
          );

          if (!matched) {
            let nearest = districts[0];
            let minD = 99999;
            districts.forEach((d) => {
              const dKey = d.name.toLowerCase();
              const clusterCoord = KNOWN_COORDINATES[dKey] || KNOWN_COORDINATES.madhubani;
              const dist = calculateDistanceKm(lat, lng, clusterCoord.lat, clusterCoord.lng);
              if (dist < minD) {
                minD = dist;
                nearest = d;
              }
            });

            matched = {
              id: detectedCity.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              name: detectedCity,
              state: detectedState,
              tagline: `${detectedBlock} Craft Network (${minD} km from ${nearest.name})`,
              artisanCount: 18,
              activeOdop: `${detectedCity} District Specialties`,
              distanceFromUser: Math.max(1.5, minD),
              badge: `ODOP ${detectedState}`,
              image: nearest.image
            };
            setDistricts((prev) => [matched, ...prev]);
          }

          const newLoc = {
            pincode,
            city: detectedCity,
            block: detectedBlock,
            state: detectedState,
            isGps: false,
            coordinates: coords,
            formatted: `${detectedCity}, ${detectedState} (${pincode})`
          };

          setUserLocation(newLoc);
          setLocationLoading(false);

          fetchProductsFromApi({
            coordinates: coords,
            originDistrict: originDistrictFilter !== "all" ? originDistrictFilter : undefined
          });

          return {
            success: true,
            data: {
              city: detectedCity,
              state: detectedState,
              block: detectedBlock,
              pincode
            }
          };
        }
      }

      // Fallback query for pincode on Nominatim
      const genRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pincode)}+India&format=json&addressdetails=1&limit=1`,
        { headers: { "Accept-Language": "en", "User-Agent": "LokKart-ODOP-Commerce/1.0" } }
      );
      if (genRes.ok) {
        const genData = await genRes.json();
        if (genData && genData.length > 0) {
          const item = genData[0];
          const addr = item.address || {};
          const detectedCity = addr.city || addr.town || addr.state_district || addr.county || "Local District";
          const detectedState = addr.state || "India";
          const detectedBlock = addr.suburb || addr.road || detectedCity;
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const coords = { lat, lng };

          const newLoc = {
            pincode,
            city: detectedCity,
            block: detectedBlock,
            state: detectedState,
            isGps: false,
            coordinates: coords,
            formatted: `${detectedCity}, ${detectedState} (${pincode})`
          };
          setUserLocation(newLoc);
          setLocationLoading(false);

          fetchProductsFromApi({
            coordinates: coords,
            originDistrict: originDistrictFilter !== "all" ? originDistrictFilter : undefined
          });

          return {
            success: true,
            data: { city: detectedCity, state: detectedState, block: detectedBlock, pincode }
          };
        }
      }

      setLocationLoading(false);
      setLocationError("Could not locate PIN on OpenStreetMap. Try searching by Area/City name.");
      return { success: false, error: "Not found" };
    } catch (err) {
      console.error("OSM Pincode lookup error:", err);
      setLocationLoading(false);
      setLocationError("Network error contacting OpenStreetMap.");
      return { success: false, error: err.message };
    }
  };

  // Browser Geolocation Detection using OpenStreetMap Nominatim Reverse Geocoding
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };

        let detectedCity = "Near You";
        let detectedState = "India";
        let detectedPin = "";
        let detectedBlock = "";

        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en", "User-Agent": "LokKart-ODOP-Commerce/1.0" } }
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData.address || {};
            detectedCity = addr.city || addr.town || addr.county || addr.state_district || "Near You";
            detectedState = addr.state || "India";
            detectedPin = addr.postcode || "";
            detectedBlock = addr.suburb || addr.neighbourhood || addr.village || "";
          }
        } catch (e) {
          console.warn("Reverse geocode fallback", e);
        }

        const newLoc = {
          pincode: detectedPin || "",
          city: detectedCity,
          block: detectedBlock || detectedCity,
          state: detectedState,
          isGps: true,
          coordinates: coords,
          formatted: `${detectedCity}, ${detectedState} (GPS Active)`
        };

        setUserLocation(newLoc);
        setLocationLoading(false);
        setIsDistrictModalOpen(false);

        // Re-fetch products with GPS coordinates for accurate road/distance calculations
        fetchProductsFromApi({
          coordinates: coords,
          originDistrict: originDistrictFilter !== "all" ? originDistrictFilter : undefined
        });
      },
      (err) => {
        console.warn("GPS permission error", err);
        setLocationError("GPS permission denied. Search by Area, Street, City or PIN Code instead.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Cart operations
  const addToCart = (product, quantity = 1, fulfillmentMode = "pickup", openCartDrawer = true) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, fulfillmentMode }
            : item
        );
      }
      return [...prev, { product, quantity, fulfillmentMode }];
    });
    if (openCartDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateCartFulfillment = (productId, fulfillmentMode) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, fulfillmentMode } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Place Order
  const placeOrder = ({
    customer,
    items,
    fulfillmentMode = "pickup",
    paymentMethod = "UPI",
    paymentStatus = "pending_cod",
    razorpayOrderId = null,
    razorpayPaymentId = null,
  }) => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LK-${orderNum}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let fee = 0;
    if (fulfillmentMode === "hyperlocal") fee = 49;
    if (fulfillmentMode === "global") fee = 99;

    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const total = subtotal + fee;

    const activeCustomer = {
      name: customer?.name || user?.name || "Ankit Raj",
      phone: customer?.phone || user?.phone || "+91 98765 43210",
      email: customer?.email || user?.email || "ankitrajdev.in@gmail.com",
      address: customer?.address || user?.city || "Civil Lines, Near DM Office",
      district: customer?.district || user?.city || "Gaya",
      state: customer?.state || user?.state || "Bihar",
      pincode: customer?.pincode || user?.pincode || "823001",
      userId: user?.id || "usr-1789754768128",
    };

    const newOrder = {
      id: orderId,
      userId: user?.id || "usr-1789754768128",
      createdAt: now.toISOString(),
      customer: activeCustomer,
      items,
      fulfillmentMode,
      fulfillmentFee: fee,
      subtotal,
      total,
      status: fulfillmentMode === "pickup" ? "ready_for_pickup" : "preparing",
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      pickupLocation: "Patwatoli Handloom Weaver Collective, Manpur, Gaya",
      runnerName: fulfillmentMode === "hyperlocal" ? "Suresh Yadav (LokKart Runner #07)" : null,
      runnerPhone: fulfillmentMode === "hyperlocal" ? "+91 98312 77410" : null,
      timeline: [
        { status: "placed", label: "Order Placed by Patron", timestamp: timeStr, done: true },
        { status: "preparing", label: "Artisan Quality Verification & GI Seal Added", timestamp: "Just now", done: true },
        {
          status: fulfillmentMode === "pickup" ? "ready_for_pickup" : "out_for_delivery",
          label: fulfillmentMode === "pickup" ? "Ready for Pickup at Atelier" : "Runner Dispatched",
          timestamp: "Pending",
          done: fulfillmentMode === "pickup"
        },
        { status: "completed", label: "Handed over to Customer", timestamp: "Pending", done: false }
      ],
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setOrders(prev => [data.order, ...prev]);
      }
    }).catch(console.error);

    clearCart();
    return newOrder;
  };

  const refreshOrders = useCallback(async (overridePhone) => {
    try {
      const phoneToUse = overridePhone || user?.phone;
      const url = phoneToUse ? `/api/orders?phone=${encodeURIComponent(phoneToUse)}` : "/api/orders";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          return data.orders;
        }
      }
    } catch (err) {
      console.error("Failed to refresh orders:", err);
    }
    return [];
  }, [user?.phone]);

  // Synchronize orders automatically when user logs in or profile phone changes
  useEffect(() => {
    if (user?.phone) {
      refreshOrders(user.phone);
    }
  }, [user?.phone, refreshOrders]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId && String(order.id) !== String(orderId)) return order;
        const timelineList = Array.isArray(order.timeline) ? order.timeline : [];
        const updatedTimeline = timelineList.map((step) => {
          if (step.status === newStatus || step.label?.toLowerCase().includes(newStatus.toLowerCase())) {
            return { ...step, done: true, timestamp: "Completed" };
          }
          return step;
        });
        return {
          ...order,
          status: newStatus,
          timeline: updatedTimeline
        };
      })
    );
  };

  const approveVerification = (verId) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === verId ? { ...v, status: "approved" } : v))
    );
  };

  const rejectVerification = (verId) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === verId ? { ...v, status: "rejected" } : v))
    );
  };

  const addProduct = (newProduct) => {
    const id = `prod-${Date.now()}`;
    const productWithMeta = {
      ...newProduct,
      id,
      rating: 5.0,
      reviewsCount: 1,
      fulfilledCount: 0,
      district: selectedDistrict?.name || "Local District",
      state: selectedDistrict?.state || "India",
      distanceKm: 2.1,
      isOdop: true,
      odopBadge: `ODOP ${selectedDistrict?.name || "Local"}`,
      giTag: "GI Tag Pending Verification",
      fulfillmentOptions: {
        pickup: { available: true, fee: 0, time: "Ready in 2 hours", note: "Atelier pickup" },
        hyperlocal: { available: true, fee: 49, time: "3-Hour Express", note: "LokKart runner" },
        global: { available: true, fee: 99, time: "2-4 Days", note: "Pan-India dispatch" }
      },
      specs: {
        material: newProduct.material || "Handmade Artisan Craft",
        origin: `${selectedDistrict?.name || "Local"}, ${selectedDistrict?.state || "India"}`
      }
    };
    
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productWithMeta)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setProducts(prev => [data.product, ...prev]);
      }
    }).catch(console.error);
    
    return productWithMeta;
  };

  return (
    <StoreContext.Provider
      value={{
        districts,
        selectedDistrict,
        setSelectedDistrict,
        userLocation,
        deliveryLocation: userLocation,
        setUserLocation,
        getUserOwnDistrict,
        originDistrictFilter,
        setOriginDistrictFilter,
        user,
        setUser,
        refreshUser,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        clearLocation,
        detectUserLocation,
        searchAddressNominatim,
        selectLocationFromNominatim,
        fetchLocationByPincode,
        fetchProductsFromApi,
        productsLoading,
        locationLoading,
        locationError,
        setLocationError,
        radiusFilter,
        setRadiusFilter,
        sellers,
        products,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartFulfillment,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isDistrictModalOpen,
        setIsDistrictModalOpen,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        orders,
        refreshOrders,
        placeOrder,
        updateOrderStatus,
        verifications,
        approveVerification,
        rejectVerification,
        addProduct
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
