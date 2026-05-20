import { Hero } from "@/components/home/hero";
import { ShopByOccasion } from "@/components/home/shop-by-occasion";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { BestSellers } from "@/components/home/best-sellers";
import { Newsletter } from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShopByOccasion />
      <WhyChooseUs />
      <FeaturedCollection />
      <BestSellers />
      <Newsletter />
    </>
  );
}
