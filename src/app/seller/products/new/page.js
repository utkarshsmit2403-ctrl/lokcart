"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSellerData } from "@/components/seller/seller-data-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  Upload,
  Link as LinkIcon,
  Tag,
  ShieldCheck,
  MapPin,
  X,
  AlertCircle
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/seller-demo-data";
import AiProductVoiceAssistantDialog from "@/components/seller/AiProductVoiceAssistant";

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useSellerData();

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Clean, Empty Initial Form State (No Hardcoded Demo Values)
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    category: "sarees",
    categoryLabel: "Handloom Sarees & Silk",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    giTag: "GI Verified",
    odopBadge: "ODOP Certified",
    primaryImage: "",
    galleryInput: "",
    specs: {
      material: "",
      origin: "",
      weave: "",
      weight: ""
    }
  });

  // Clean Initial Variants (Empty by default)
  const [variants, setVariants] = useState([]);

  const updateForm = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errorMsg) setErrorMsg(null);
  };

  const updateSpecs = (key) => (e) =>
    setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: e.target.value } }));

  // Direct Cloudflare R2 Upload Helper using multipart/form-data
  const uploadFileToR2 = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.success && data.publicUrl) {
      return data.publicUrl;
    }
    throw new Error(data.error || "Upload failed");
  };

  // Primary Image Upload Handler
  const handlePrimaryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPrimary(true);
    try {
      const publicUrl = await uploadFileToR2(file);
      setForm((prev) => ({ ...prev, primaryImage: publicUrl }));
    } catch (err) {
      console.error("Primary upload failed:", err);
      setErrorMsg("Failed to upload image to Cloudflare R2. Please try again.");
    } finally {
      setIsUploadingPrimary(false);
    }
  };

  // Gallery Images Multi-Upload Handler
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadFileToR2(file);
        if (url) uploadedUrls.push(url);
      }

      setForm((prev) => {
        const existing = prev.galleryInput ? prev.galleryInput.split(",").map((s) => s.trim()).filter(Boolean) : [];
        const combined = [...existing, ...uploadedUrls];
        return {
          ...prev,
          galleryInput: combined.join(", ")
        };
      });
    } catch (err) {
      console.error("Gallery upload failed:", err);
      setErrorMsg("Failed to upload one or more gallery images.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  // Variant Image Upload Handler
  const handleVariantImageUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVariantIdx(idx);
    try {
      const publicUrl = await uploadFileToR2(file);
      updateVariant(idx, "image", publicUrl);
    } catch (err) {
      console.error("Variant image upload failed:", err);
    } finally {
      setUploadingVariantIdx(null);
    }
  };

  // Remove a gallery image
  const removeGalleryImage = (targetUrl) => {
    setForm((prev) => {
      const urls = prev.galleryInput.split(",").map((s) => s.trim()).filter((u) => u && u !== targetUrl);
      return { ...prev, galleryInput: urls.join(", ") };
    });
  };

  // Add Variant Row
  const addVariantRow = () => {
    const nextIdx = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        name: `Variant ${nextIdx}`,
        color: "Natural",
        colorHex: "#C2410C",
        size: "Standard",
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        price: form.price ? Number(form.price) : "",
        originalPrice: form.originalPrice ? Number(form.originalPrice) : "",
        stock: 5,
        image: form.primaryImage || ""
      }
    ]);
  };

  const updateVariant = (idx, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const removeVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!form.name.trim()) {
      setErrorMsg("Please provide a product title before publishing.");
      return;
    }

    if (!form.price) {
      setErrorMsg("Please enter a selling price.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const galleryUrls = form.galleryInput
      ? form.galleryInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
      stock: Number(form.stock) || 1,
      images: {
        primary: form.primaryImage || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        gallery: galleryUrls
      },
      variants: variants.length > 0 ? variants : [
        {
          id: `v-${Date.now()}`,
          name: form.name,
          color: "Standard",
          colorHex: "#111827",
          size: "Standard",
          sku: `SKU-${Date.now().toString().slice(-4)}`,
          price: Number(form.price) || 0,
          originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
          stock: Number(form.stock) || 1,
          image: form.primaryImage || ""
        }
      ]
    };

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to save product to database.");
      }

      addProduct(payload);
      setIsLoading(false);
      setSuccessMsg("Craft product successfully published to live catalog!");
      setTimeout(() => {
        router.push("/seller/inventory");
      }, 1000);
    } catch (err) {
      console.warn("API fallback:", err);
      addProduct(payload);
      setIsLoading(false);
      setSuccessMsg("Craft product saved to inventory!");
      setTimeout(() => {
        router.push("/seller/inventory");
      }, 1000);
    }
  };

  const parsedGallery = form.galleryInput
    ? form.galleryInput.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-[1200px] mx-auto space-y-[24px] pb-[48px]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/seller/inventory"
            className="text-xs font-bold text-brand-subtle hover:text-brand-primary flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
          <h1 className="text-3xl font-extrabold text-brand-primary tracking-tight">Create Craft Listing</h1>
          <p className="text-sm font-medium text-brand-subtle mt-1">
            Add detailed product specifications, variants, and high-resolution photos of your craft.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-card bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-card bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Assistant Studio Modal Banner */}
      <Card className="p-[24px] rounded-card border-brand-tertiary/20 bg-gradient-to-br from-brand-tertiary/5 via-card to-brand-tertiary/10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-brand-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-md font-bold text-brand-primary">AI Product Assistant</h3>
              <p className="text-sm font-medium text-brand-subtle mt-1 max-w-2xl">
                List products in seconds. Upload a craft photo and our intelligent assistant will seamlessly detect the origin, materials, suggest titles, and fill the entire form for you.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsAiDialogOpen(true)}
            className="h-[48px] px-6 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-white font-bold text-sm flex items-center gap-2 shadow-sm shrink-0 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <Sparkles size={18} />
            <span>Open AI Studio</span>
          </Button>
        </div>
      </Card>

      {/* AI Assistant Modal Dialog */}
      <AiProductVoiceAssistantDialog
        isOpen={isAiDialogOpen}
        onOpenChange={setIsAiDialogOpen}
        form={form}
        setForm={setForm}
        onApply={(aiForm, aiVariants) => {
          setForm((prev) => ({ ...prev, ...aiForm }));
          if (aiVariants && aiVariants.length > 0) {
            setVariants(aiVariants);
          }
          setSuccessMsg("Product specifications successfully applied from AI Assistant!");
          setTimeout(() => setSuccessMsg(null), 4000);
        }}
        onPublish={(aiForm, aiVariants) => {
          if (aiVariants && aiVariants.length > 0) {
            setVariants(aiVariants);
          }
          handleSubmit();
        }}
        isPublishing={isLoading}
      />

      {/* Manual Product Creation Form */}
      <form id="product-creation-form" onSubmit={handleSubmit} className="space-y-[24px]">
        {/* Card 1: Product Media Upload */}
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <div className="flex items-center justify-between pb-3 border-b border-brand-line">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-brand-tertiary">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-brand-primary">Product Imagery & Media</h3>
            </div>
            <Badge variant="outline" className="bg-muted text-brand-primary border-brand-line px-2 py-0.5 rounded-pill text-[10px] font-bold">
              Media Upload
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Cover Image Preview / Dropzone */}
            <div className="md:col-span-1 space-y-2">
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                Primary Cover Image *
              </label>

              {form.primaryImage ? (
                <div className="relative aspect-square w-full rounded-card border border-brand-line bg-muted overflow-hidden group">
                  <img
                    src={form.primaryImage}
                    alt="Primary Cover"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-brand-primary text-primary-foreground text-[10px] font-bold">
                    Cover Photo
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, primaryImage: "" }))}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove Cover Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="aspect-square w-full rounded-card border-2 border-dashed border-brand-line hover:border-brand-tertiary/60 bg-muted/40 hover:bg-brand-tertiary/5 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all">
                  <Upload className="w-8 h-8 text-brand-tertiary mb-2" />
                  <span className="text-xs font-bold text-brand-primary">Click to Upload Cover Image</span>
                  <span className="text-[10px] text-brand-subtle mt-1">PNG, JPG or WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageUpload}
                    disabled={isUploadingPrimary}
                    className="hidden"
                  />
                </label>
              )}

              {isUploadingPrimary && (
                <div className="flex items-center gap-2 text-xs font-bold text-brand-tertiary pt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading photo...</span>
                </div>
              )}
            </div>

            {/* URL Input & Gallery Multi-Upload */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-brand-tertiary" /> Primary Image Direct URL
                </label>
                <Input
                  value={form.primaryImage}
                  onChange={updateForm("primaryImage")}
                  placeholder="https://cdn.gpgaya.in/crafts/... or image link"
                  className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
                />
              </div>

              {/* Gallery Upload Section */}
              <div className="space-y-2 pt-2 border-t border-brand-line/60">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                    Additional Gallery Images
                  </label>
                  <label className="h-8 px-3 rounded-lg bg-card border border-brand-line text-brand-primary text-xs font-bold flex items-center gap-1.5 hover:bg-muted cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-brand-tertiary" />
                    <span>{isUploadingGallery ? "Uploading..." : "Upload Gallery Photos"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      disabled={isUploadingGallery}
                      className="hidden"
                    />
                  </label>
                </div>

                <Input
                  value={form.galleryInput}
                  onChange={updateForm("galleryInput")}
                  placeholder="Comma separated image URLs (e.g. https://..., https://...)"
                  className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
                />

                {/* Uploaded Gallery Thumbnails */}
                {parsedGallery.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
                    {parsedGallery.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-line bg-card shrink-0 group"
                      >
                        <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(url)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Basic Product Information */}
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <div className="flex items-center justify-between pb-3 border-b border-brand-line">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-brand-tertiary">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-brand-primary">Basic Product Information</h3>
            </div>
            <span className="text-xs font-bold text-destructive">* Required Fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                Product Title *
              </label>
              <Input
                value={form.name}
                onChange={updateForm("name")}
                placeholder="e.g. Bhagalpuri Pure Tussar Silk Saree"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Tagline / Short Summary
              </label>
              <Input
                value={form.tagline}
                onChange={updateForm("tagline")}
                placeholder="e.g. Authentic hand-painted motif on pure pit-loom woven silk"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                Craft Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  const cat = PRODUCT_CATEGORIES.find((c) => c.value === e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                    categoryLabel: cat?.label || "Handloom Sarees & Silk"
                  }));
                }}
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm cursor-pointer"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                Base Selling Price (&#8377;) *
              </label>
              <Input
                type="number"
                value={form.price}
                onChange={updateForm("price")}
                placeholder="e.g. 2500"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Original MRP / Strike Price (&#8377;)
              </label>
              <Input
                type="number"
                value={form.originalPrice}
                onChange={updateForm("originalPrice")}
                placeholder="e.g. 3500"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">
                Available Stock Count *
              </label>
              <Input
                type="number"
                value={form.stock}
                onChange={updateForm("stock")}
                placeholder="e.g. 10"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Artisan Story & Narrative Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={updateForm("description")}
                placeholder="Describe the artisan background, traditional crafting process, cultural heritage, and care instructions..."
                className="w-full p-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Enhanced Variant Inventory Builder */}
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-line gap-[16px]">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-brand-tertiary">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-md font-bold text-brand-primary">Product Variants & Options</h3>
              </div>
              <p className="text-sm font-medium text-brand-subtle mt-1.5 ml-11">
                Add variants for different sizes, colors, hex palettes, and individual SKUs. (Optional)
              </p>
            </div>
            <Button
              type="button"
              onClick={addVariantRow}
              className="h-[40px] px-4 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variant</span>
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-brand-line/80 bg-muted/20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Layers className="w-6 h-6 text-brand-subtle" />
              </div>
              <p className="text-sm font-extrabold text-brand-primary">No variants configured</p>
              <p className="text-xs text-brand-subtle font-medium max-w-md mx-auto leading-relaxed">
                By default, your craft product will be listed as a standard single item using the primary image, price, and stock above. Click "Add Variant" if you have multiple colorways or sizes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, idx) => (
                <div
                  key={variant.id}
                  className="p-4 rounded-card bg-muted/50 border border-brand-line space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-brand-line/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-brand-line shadow-xs"
                        style={{ backgroundColor: variant.colorHex || "#111827" }}
                      />
                      <span className="text-xs font-bold text-brand-primary">
                        Variant #{idx + 1}: {variant.name || "Untitled Variant"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-brand-subtle uppercase">
                        Variant Title
                      </label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(idx, "name", e.target.value)}
                        placeholder="e.g. Natural Ivory White"
                        className="h-[40px] px-3 bg-muted border-brand-line rounded-input text-xs font-medium text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-brand-subtle uppercase">
                        Color & Hex
                      </label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={variant.colorHex || "#111827"}
                          onChange={(e) => updateVariant(idx, "colorHex", e.target.value)}
                          className="w-9 h-9 rounded-lg border border-brand-line cursor-pointer bg-card p-0.5 shrink-0"
                        />
                        <Input
                          value={variant.color}
                          onChange={(e) => updateVariant(idx, "color", e.target.value)}
                          placeholder="Color"
                          className="h-[40px] px-3 bg-muted border-brand-line rounded-input text-xs font-medium text-brand-primary flex-1 focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-brand-subtle uppercase">
                        Size / Dimensions
                      </label>
                      <Input
                        value={variant.size}
                        onChange={(e) => updateVariant(idx, "size", e.target.value)}
                        placeholder="e.g. 6.3m / M / L"
                        className="h-[40px] px-3 bg-muted border-brand-line rounded-input text-xs font-medium text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-brand-subtle uppercase">
                        SKU Identifier
                      </label>
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                        placeholder="SKU-001"
                        className="h-[40px] px-3 bg-muted border-brand-line rounded-input text-xs font-medium text-brand-primary focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-brand-subtle uppercase">
                        Price (&#8377;) & Stock
                      </label>
                      <div className="flex gap-1.5">
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(idx, "price", e.target.value)}
                          placeholder="Price"
                          className="h-[40px] px-3 bg-muted border-brand-line rounded-input text-xs font-medium text-brand-primary w-1/2 focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                        />
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                          placeholder="Stock"
                          className="h-[40px] px-3 bg-muted border-brand-line rounded-input text-xs font-medium text-brand-primary w-1/2 focus-visible:ring-1 focus-visible:ring-brand-tertiary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Card 4: Craft Specifications & Authenticity */}
        <Card className="p-[24px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
          <div className="flex items-center justify-between pb-3 border-b border-brand-line">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-brand-tertiary">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-brand-primary">Specifications & Origin Details</h3>
            </div>
            <Badge variant="outline" className="bg-muted text-brand-primary border-brand-line px-2 py-0.5 rounded-pill text-[10px] font-bold">
              Artisan Metadata
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Material & Composition
              </label>
              <Input
                value={form.specs.material}
                onChange={updateSpecs("material")}
                placeholder="e.g. 100% Pure Tussar Silk, Organic Dyes"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Origin Craft District
              </label>
              <Input
                value={form.specs.origin}
                onChange={updateSpecs("origin")}
                placeholder="e.g. Bhagalpur, Bihar"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Crafting Technique / Weave
              </label>
              <Input
                value={form.specs.weave}
                onChange={updateSpecs("weave")}
                placeholder="e.g. Traditional Pit Loom Handloom"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                Package / Product Weight
              </label>
              <Input
                value={form.specs.weight}
                onChange={updateSpecs("weight")}
                placeholder="e.g. 550g"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                GI Tag Certification
              </label>
              <Input
                value={form.giTag}
                onChange={updateForm("giTag")}
                placeholder="e.g. GI Verified (Bhagalpur Silk)"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-subtle uppercase tracking-wider">
                ODOP Badge Tier
              </label>
              <Input
                value={form.odopBadge}
                onChange={updateForm("odopBadge")}
                placeholder="e.g. ODOP Certified (One District One Product)"
                className="h-[48px] w-full px-4 bg-muted border-brand-line rounded-input text-sm font-bold text-brand-primary placeholder:text-brand-subtle focus-visible:ring-1 focus-visible:ring-brand-tertiary shadow-sm"
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 pb-8">
          <Link
            href="/seller/inventory"
            variant="outline" className="h-[44px] px-4 rounded-button bg-card border-brand-line text-brand-primary hover:bg-muted font-bold text-sm shadow-sm transition-transform active:scale-[0.98]"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-[48px] px-6 rounded-button bg-brand-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publishing Craft Product...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Publish Product to Catalog</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}