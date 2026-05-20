"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/shared/product-card";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { getBestSellerProducts } from "@/services/product-service";
import type { Product } from "@/types";

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  // Fetch products from service (API or seed data)
  useEffect(() => {
    getBestSellerProducts(locale).then(setProducts);
  }, [locale]);

  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title={t.bestSellers.title}
          subtitle={t.bestSellers.subtitle}
        />
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
