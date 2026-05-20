"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/shared/product-card";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import type { Product } from "@/types";

const bestSellerKeys = [
  {
    key: "classicRed" as const,
    product: {
      id: "bs1", price: 550,
      image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
      category: "roses", rating: 4.9, reviewCount: 256, inStock: true, isBestSeller: true,
    },
  },
  {
    key: "pastelDream" as const,
    product: {
      id: "bs2", price: 720, salePrice: 599,
      image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
      category: "mixed", rating: 4.8, reviewCount: 189, inStock: true, isBestSeller: true,
    },
  },
  {
    key: "tulipParadise" as const,
    product: {
      id: "bs3", price: 480,
      image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
      category: "tulips", rating: 4.7, reviewCount: 142, inStock: true, isBestSeller: true,
    },
  },
  {
    key: "luxuryWhiteGold" as const,
    product: {
      id: "bs4", price: 950, salePrice: 799,
      image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
      category: "luxury", rating: 4.9, reviewCount: 201, inStock: true, isBestSeller: true, isNew: true,
    },
  },
];

export function BestSellers() {
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  const bestSellers: Product[] = bestSellerKeys.map((item) => ({
    ...item.product,
    name: t.bestSellers.products[item.key].name,
    description: t.bestSellers.products[item.key].description,
  }));

  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title={t.bestSellers.title}
          subtitle={t.bestSellers.subtitle}
        />
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
