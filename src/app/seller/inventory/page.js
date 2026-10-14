"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSellerData } from "@/components/seller/seller-data-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PackageSearch,
  Plus,
  Search,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function SellerInventoryPage() {
  const { products, updateVariantStock, removeProduct } = useSellerData();
  const [search, setSearch] = useState("");
  const [expandedProduct, setExpandedProduct] = useState(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.variants?.some((v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary">Inventory & Variant Stock</h2>
          <p className="text-xs font-medium text-brand-subtle">
            Manage product stock levels and specific color variations like White Saree, Black Saree, etc.
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="h-[40px] px-4 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-tertiary-foreground text-xs font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center gap-1.5 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Craft Listing
        </Link>
      </div>

      {/* Control Bar */}
      <Card className="p-[16px] rounded-card border-brand-line bg-card shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by product title, variant color (White Saree), or SKU..."
            className="h-[40px] pl-10 bg-muted border-brand-line rounded-input text-xs font-bold text-brand-primary"
          />
        </div>
      </Card>

      {/* Products & Variants List */}
      <div className="space-y-[16px]">
        {filteredProducts.map((product) => {
          const isExpanded = expandedProduct === product.id;
          const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? product.stock;

          return (
            <Card key={product.id} className="p-[20px] rounded-card border-brand-line bg-card shadow-sm space-y-[16px]">
              {/* Main Product Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                <div className="flex items-center gap-[16px]">
                  <img
                    src={product.images?.primary || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"}
                    alt={product.name}
                    className="w-[56px] h-[56px] rounded-card object-cover border border-brand-line shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-[8px]">
                      <h3 className="text-md font-bold text-brand-primary">{product.name}</h3>
                      <Badge className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider">
                        {product.categoryLabel || product.category}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-brand-subtle mt-0.5">
                      Base Price: <strong className="text-brand-primary font-bold">&#8377;{product.price}</strong> &bull; Total Stock: <strong className="text-brand-primary font-bold">{totalStock} units</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-[12px]">
                  <Badge className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${totalStock > 5 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : totalStock > 0 ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    {totalStock > 5 ? 'In Stock' : totalStock > 0 ? 'Low Stock Warning' : 'Out of Stock'}
                  </Badge>

                  <Button
                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                    variant="outline"
                    className="h-[38px] px-3 rounded-button bg-muted border-brand-line text-brand-primary text-xs font-bold hover:bg-card transition-transform active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-brand-tertiary" />
                    {product.variants?.length || 1} Variants
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>

                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-input transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nested Variant Breakdown Table */}
              {isExpanded && (
                <div className="pt-3 border-t border-brand-line space-y-[12px] bg-muted/50 p-[16px] rounded-card">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-line">
                    <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-tertiary" /> Color & Size Variants Inventory
                    </h4>
                    <span className="text-[11px] font-medium text-brand-subtle">Direct Stock Editing</span>
                  </div>

                  <div className="divide-y divide-brand-line custom-scrollbar">
                    {(product.variants || []).map((variant) => (
                      <div key={variant.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
                        <div className="flex items-center gap-[12px]">
                          <img
                            src={variant.image || product.images?.primary}
                            alt={variant.name}
                            className="w-[40px] h-[40px] rounded-input object-cover border border-brand-line"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full border border-brand-line" style={{ backgroundColor: variant.colorHex || "#fff" }}></span>
                              <span className="text-xs font-bold text-brand-primary">{variant.name}</span>
                            </div>
                            <p className="text-[11px] font-medium text-brand-subtle">
                              SKU: {variant.sku} &bull; Size: {variant.size} &bull; Price: &#8377;{variant.price}
                            </p>
                          </div>
                        </div>

                        {/* Inline Stock Controls */}
                        <div className="flex items-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() => updateVariantStock(product.id, variant.id, variant.stock - 1)}
                            className="w-8 h-8 rounded-button bg-card border border-brand-line text-brand-primary font-bold text-xs flex items-center justify-center hover:bg-muted active:scale-95 cursor-pointer"
                          >
                            -
                          </button>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariantStock(product.id, variant.id, e.target.value)}
                            className="w-16 h-8 text-center bg-card border-brand-line rounded-input text-xs font-bold text-brand-primary"
                          />
                          <button
                            type="button"
                            onClick={() => updateVariantStock(product.id, variant.id, variant.stock + 1)}
                            className="w-8 h-8 rounded-button bg-card border border-brand-line text-brand-primary font-bold text-xs flex items-center justify-center hover:bg-muted active:scale-95 cursor-pointer"
                          >
                            +
                          </button>

                          <Badge className={`px-2 py-0.5 rounded-pill text-[9px] font-bold uppercase tracking-wider ml-2 ${variant.stock > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                            {variant.stock > 0 ? `${variant.stock} units` : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filteredProducts.length === 0 && (
          <Card className="p-[40px] text-center rounded-card border-brand-line bg-card shadow-sm space-y-[12px]">
            <PackageSearch className="w-10 h-10 text-brand-subtle mx-auto" />
            <h3 className="text-md font-bold text-brand-primary">No products found</h3>
            <p className="text-xs font-medium text-brand-subtle">Try adjusting your search query.</p>
          </Card>
        )}
      </div>
    </div>
  );
}