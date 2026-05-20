"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";

const instagramImages = [
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=400&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80",
];

export function InstagramGallery() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="Follow Us on Instagram"
          subtitle="@havanaflowers.qa"
        />
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          {instagramImages.map((image, index) => (
            <StaggerItem key={index}>
              <motion.a
                href="https://instagram.com/havanaflowers.qa"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="group relative block aspect-square overflow-hidden rounded-xl cursor-pointer"
              >
                <img
                  src={image}
                  alt="Havana Flowers Instagram"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-xl">
                    <Camera className="h-7 w-7 text-pink-600" />
                  </div>
                </div>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
