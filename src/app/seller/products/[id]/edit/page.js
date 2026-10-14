"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, PackageX, Trash2 } from "lucide-react";
import { useSellerData } from "@/components/seller/seller-data-context";
import PageHeader from "@/components/seller/page-header";
import { PRODUCT_CATEGORIES } from "@/lib/seller-demo-data";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const { seller, products, updateProduct, removeProduct } = useSellerData();
  const existingProduct = products.find((p) => p.id === productId) || null;

  const [form, setForm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prefill the form once the product is found (products loads synchronously
  // from context here, but this guards against future async data sources).
  useEffect(() => {
    if (existingProduct && !form) {
      setForm({
        name: existingProduct.name || "",
        category: existingProduct.category || "sarees",
        price: existingProduct.price ?? 0,
        stock: existingProduct.stock ?? 0,
        tagline: existingProduct.tagline || "",
        description: existingProduct.description || "",
        material: existingProduct.specs?.material || "",
        image: existingProduct.images?.primary || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProduct]);

  // Product not found — show a friendly empty state instead of a form.
  if (!existingProduct) {
    return (
      <>
        <PageHeader
          title="Edit craft listing"
          subtitle="This listing could not be found."
          action={
            <Link
              href="/seller/inventory"
              className="h-[40px] px-4 rounded-button border border-brand-line text-brand-primary text-sm font-bold hover:bg-muted flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to inventory
            </Link>
          }
        />
        <div className="p-5 sm:p-8 max-w-3xl w-full">
          <div className="bg-card rounded-card border border-brand-line shadow-sm p-10 flex flex-col items-center text-center gap-2">
            <PackageX className="w-8 h-8 text-brand-subtle" />
            <p className="text-sm font-bold text-brand-primary">Craft listing not found</p>
            <p className="text-xs text-brand-subtle">
              It may have been removed. Head back to inventory to see your active listings.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Still preparing the form state on first render.
  if (!form) return null;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryLabel =
      PRODUCT_CATEGORIES.find((c) => c.value === form.category)?.label || existingProduct.categoryLabel;

    updateProduct(existingProduct.id, {
      name: form.name,
      tagline: form.tagline || form.name,
      category: form.category,
      categoryLabel,
      price: Number(form.price),
      stock: Number(form.stock),
      images: { ...existingProduct.images, primary: form.image },
      description: form.description,
      specs: { ...existingProduct.specs, material: form.material },
    });

    router.push("/seller/inventory");
  };

  const handleDelete = () => {
    if (isDeleting) {
      removeProduct(existingProduct.id);
      router.push("/seller/inventory");
      return;
    }
    setIsDeleting(true);
  };

  return (
    <>
      <PageHeader
        title="Edit craft listing"
        subtitle={`Update details for "${existingProduct.name}".`}
        action={
          <Link
            href="/seller/inventory"
            className="h-[40px] px-4 rounded-button border border-brand-line text-brand-primary text-sm font-bold hover:bg-muted flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>
        }
      />

      <div className="p-5 sm:p-8 max-w-3xl w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-card rounded-card border border-brand-line shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-primary pb-3 border-b border-brand-line">Basic details</h3>

            <div>
              <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Craft title</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={update("name")}
                placeholder="e.g. Madhubani Lotus Folk Stole"
                className="w-full h-[44px] px-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={update("tagline")}
                placeholder="One line that sells the craft"
                className="w-full h-[44px] px-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={update("category")}
                  className="w-full h-[44px] px-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Material</label>
                <input
                  type="text"
                  value={form.material}
                  onChange={update("material")}
                  className="w-full h-[44px] px-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card rounded-card border border-brand-line shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-primary pb-3 border-b border-brand-line">Pricing & stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={update("price")}
                  className="w-full h-[44px] px-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Stock units</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={update("stock")}
                  className="w-full h-[44px] px-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-card rounded-card border border-brand-line shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-primary pb-3 border-b border-brand-line">Story & image</h3>
            <div>
              <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={update("description")}
                placeholder="Details of natural pigments, technique, the artisan's story..."
                className="w-full p-3.5 rounded-input bg-muted border border-brand-line text-sm font-semibold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary"
              />
            </div>

            <div className="flex items-center gap-3">
              <img src={form.image} alt="Preview" className="w-16 h-16 rounded-input object-cover border border-brand-line flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block font-bold text-brand-subtle text-[10px] uppercase tracking-wide mb-1">Image URL</label>
                <div className="relative flex items-center">
                  <ImagePlus className="absolute left-3.5 w-4 h-4 text-brand-subtle" />
                  <input
                    type="text"
                    value={form.image}
                    onChange={update("image")}
                    className="w-full h-[40px] pl-10 pr-3 rounded-input bg-muted border border-brand-line text-xs font-semibold text-brand-primary truncate"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className={`h-[44px] px-4 rounded-button border text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isDeleting
                  ? "bg-destructive text-white border-destructive hover:bg-destructive/90"
                  : "border-destructive/30 text-destructive hover:bg-destructive/10"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Click again to confirm delete" : "Delete listing"}
            </button>

            <div className="flex justify-end gap-2">
              <Link
                href="/seller/inventory"
                className="h-[44px] px-4 rounded-button border border-brand-line text-brand-primary text-sm font-semibold hover:bg-muted flex items-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="h-[44px] px-5 rounded-button bg-brand-primary text-primary-foreground text-sm font-bold shadow-sm hover:bg-brand-secondary transition-transform active:scale-[0.98]"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}