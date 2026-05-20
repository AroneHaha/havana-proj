"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/shared/product-card";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";
import type { Product } from "@/types";

const bestSellers: Product[] = [
  {
    id: "bs1", name: "Classic Red Rose Box",
    description: "24 premium red roses in luxury box",
    price: 550,
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
    category: "roses", rating: 4.9, reviewCount: 256, inStock: true, isBestSeller: true,
  },
  {
    id: "bs2", name: "Pastel Dream Arrangement",
    description: "Soft pastel floral arrangement",
    price: 720, salePrice: 599,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
    category: "mixed", rating: 4.8, reviewCount: 189, inStock: true, isBestSeller: true,
  },
  {
    id: "bs3", name: "Tulip Paradise",
    description: "Colorful tulip bouquet",
    price: 480,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
    category: "tulips", rating: 4.7, reviewCount: 142, inStock: true, isBestSeller: true,
  },
  {
    id: "bs4", name: "Luxury White & Gold",
    description: "White roses with gold accents",
    price: 950, salePrice: 799,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
    category: "luxury", rating: 4.9, reviewCount: 201, inStock: true, isBestSeller: true, isNew: true,
  },
];

export function BestSellers() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="Best Sellers"
          subtitle="Most loved arrangements by our customers"
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
