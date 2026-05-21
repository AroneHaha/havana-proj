import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { DirectionProvider } from "@/components/shared/direction-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Havana Flowers | Qatar's Premier Luxury Floral Boutique",
  description:
    "Experience the finest flower arrangements crafted with passion and elegance for every special moment in Qatar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${notoArabic.variable} antialiased`}>
        <ThemeProvider>
            <DirectionProvider>
            <Header />
            <CartDrawer />
            <MobileNav />
            <main>{children}</main>
            <Footer />
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
