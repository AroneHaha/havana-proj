"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/shared/product-card";
import type { Product } from "@/types";

const featuredProducts: Product[] = [
  {
    id: "fp1", name: "Royal Rose Symphony",
    description: "Luxurious red roses arrangement",
    price: 850, salePrice: 699,
    image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&q=80",
    category: "roses", rating: 4.9, reviewCount: 128, inStock: true, isFeatured: true,
  },
  {
    id: "fp2", name: "Golden Hour Bouquet",
    description: "Sunflowers and gold accents",
    price: 620,
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
    category: "mixed", rating: 4.8, reviewCount: 95, inStock: true, isFeatured: true,
  },
  {
    id: "fp3", name: "Midnight Orchid Elegance",
    description: "Exotic orchids in dark vase",
    price: 1200, salePrice: 999,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
    category: "orchids", rating: 5.0, reviewCount: 67, inStock: true, isFeatured: true,
  },
  {
    id: "fp4", name: "Pearl White Lilies",
    description: "Elegant white lily arrangement",
    price: 780,
    image: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&q=80",
    category: "lilies", rating: 4.7, reviewCount: 84, inStock: true, isFeatured: true, isNew: true,
  },
];

export function FeaturedCollection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader
            title="Featured Collection"
            subtitle="Handpicked selections from our master florists"
            align="start"
            className="mb-0"
          />
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 lg:px-8">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 -ml-4 lg:-ml-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] pl-4 lg:pl-8">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
