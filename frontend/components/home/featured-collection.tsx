"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/shared/product-card";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { getFeaturedProducts } from "@/services/product-service";
import type { Product } from "@/types";

export function FeaturedCollection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  // Fetch products from service (API or seed data)
  useEffect(() => {
    getFeaturedProducts(locale).then(setProducts);
  }, [locale]);

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

  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader
            title={t.featuredCollection.title}
            subtitle={t.featuredCollection.subtitle}
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
            {products.map((product, index) => (
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
