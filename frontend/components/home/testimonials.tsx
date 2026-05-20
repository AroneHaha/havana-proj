"use client";

import { Quote, BadgeCheck } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { RatingStars } from "@/components/shared/rating-stars";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-container";

const testimonials = [
  {
    id: "t1",
    name: "Ahmad Al-Thani",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    review: "Absolutely stunning arrangement! The roses were fresh and the delivery was right on time for our anniversary. Havana Flowers exceeded all expectations. Will definitely order again!",
    date: "2024-12-15",
    verified: true,
  },
  {
    id: "t2",
    name: "Sara Mahmoud",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
    review: "I ordered the wedding package and everything was perfect. The attention to detail was remarkable. My guests couldn't stop complimenting the floral decorations!",
    date: "2024-11-20",
    verified: true,
  },
  {
    id: "t3",
    name: "Khalid bin Mohammed",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    rating: 4.5,
    review: "Excellent quality flowers and the same-day delivery saved me! The customer service team was incredibly helpful in choosing the right arrangement for Mother's Day.",
    date: "2024-10-05",
    verified: true,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="What Our Customers Say"
          subtitle="Real reviews from our valued customers"
        />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <StaggerItem key={item.id}>
              <div className="group relative h-full rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-maroon/10 dark:text-gold/10 mb-4" />
                {/* Review text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  &ldquo;{item.review}&rdquo;
                </p>
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <RatingStars rating={item.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">{item.rating}</span>
                </div>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{item.name}</span>
                      {item.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
