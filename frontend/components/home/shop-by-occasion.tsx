"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Cake, GraduationCap, Flower2, Star, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";

const occasionKeys = [
  { key: "Eid", icon: Star, image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&q=80", color: "from-amber-500/80 to-amber-700/80" },
  { key: "Weddings", icon: Sparkles, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", color: "from-rose-500/80 to-rose-700/80" },
  { key: "Birthday", icon: Cake, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80", color: "from-purple-500/80 to-purple-700/80" },
  { key: "Anniversary", icon: Heart, image: "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=400&q=80", color: "from-pink-500/80 to-pink-700/80" },
  { key: "Graduation", icon: GraduationCap, image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&q=80", color: "from-blue-500/80 to-blue-700/80" },
  { key: "Mother's Day", icon: Flower2, image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&q=80", color: "from-fuchsia-500/80 to-fuchsia-700/80" },
  { key: "Love & Romance", icon: Heart, image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80", color: "from-red-500/80 to-red-700/80" },
  { key: "Sympathy", icon: Leaf, image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80", color: "from-gray-500/80 to-gray-700/80" },
];

export function ShopByOccasion() {
  return (
    <section id="occasions" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="Shop by Occasion"
          subtitle="Find the perfect arrangement for every celebration"
        />
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {occasionKeys.map((occasion) => (
            <StaggerItem key={occasion.key}>
              <motion.a
                href="#"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer"
              >
                <img
                  src={occasion.image}
                  alt={occasion.key}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={cn("absolute inset-0 bg-gradient-to-t", occasion.color)} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <occasion.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-lg lg:text-xl font-bold drop-shadow-lg">{occasion.key}</h3>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
