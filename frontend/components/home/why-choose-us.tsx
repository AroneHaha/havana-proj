"use client";

import { motion } from "framer-motion";
import { Truck, Clock, Award, HeadphonesIcon, Palette, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";

const features = [
  {
    key: "sameDay",
    icon: Truck,
    gradient: "from-rose-500 to-rose-600",
    title: "Same-Day Delivery",
    description: "Order before 2 PM and receive your flowers the very same day across Qatar.",
  },
  {
    key: "freshness",
    icon: Clock,
    gradient: "from-emerald-500 to-emerald-600",
    title: "7-Day Freshness",
    description: "Our flowers stay fresh and vibrant for a minimum of 7 days guaranteed.",
  },
  {
    key: "premium",
    icon: Award,
    gradient: "from-gold to-gold-dark",
    title: "Premium Quality",
    description: "Hand-selected blooms sourced from the world's finest flower farms.",
  },
  {
    key: "support",
    icon: HeadphonesIcon,
    gradient: "from-blue-500 to-blue-600",
    title: "24/7 Support",
    description: "Round-the-clock customer service for all your floral needs.",
  },
  {
    key: "personalized",
    icon: Palette,
    gradient: "from-purple-500 to-purple-600",
    title: "Personalized Touch",
    description: "Custom arrangements tailored to your exact preferences and vision.",
  },
  {
    key: "eco",
    icon: Leaf,
    gradient: "from-teal-500 to-teal-600",
    title: "Eco-Conscious",
    description: "Sustainable packaging and eco-friendly practices at every step.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="Why Choose Havana Flowers"
          subtitle="We deliver excellence with every petal"
        />
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <StaggerItem key={feature.key}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Subtle gradient accent */}
                <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg mb-5", feature.gradient)}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
