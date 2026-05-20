/**
 * Base translation type using `string` for all text values.
 * Both en.ts and ar.ts satisfy this type.
 */

export interface Translation {
  dir: "ltr" | "rtl";

  announcement: {
    text: string;
  };

  nav: {
    home: string;
    shop: string;
    categories: string;
    occasions: string;
    blog: string;
    about: string;
    contact: string;
  };

  occasions: {
    eid: string;
    weddings: string;
    birthday: string;
    anniversary: string;
    graduation: string;
    mothersDay: string;
    loveRomance: string;
    sympathy: string;
  };

  hero: {
    badge: string;
    title: string;
    description: string;
    shopCollection: string;
    customOrders: string;
    scroll: string;
  };

  shopByOccasion: {
    title: string;
    subtitle: string;
  };

  whyChooseUs: {
    title: string;
    subtitle: string;
    sameDay: { title: string; description: string };
    freshness: { title: string; description: string };
    premium: { title: string; description: string };
    support: { title: string; description: string };
    personalized: { title: string; description: string };
    eco: { title: string; description: string };
  };

  featuredCollection: {
    title: string;
    subtitle: string;
    products: {
      royalRose: { name: string; description: string };
      goldenHour: { name: string; description: string };
      midnightOrchid: { name: string; description: string };
      pearlLilies: { name: string; description: string };
    };
  };

  bestSellers: {
    title: string;
    subtitle: string;
    products: {
      classicRed: { name: string; description: string };
      pastelDream: { name: string; description: string };
      tulipParadise: { name: string; description: string };
      luxuryWhiteGold: { name: string; description: string };
    };
  };

  productCard: {
    addToCart: string;
    bestSeller: string;
    new: string;
  };

  testimonials: {
    title: string;
    subtitle: string;
    reviews: {
      ahmad: { review: string };
      sara: { review: string };
      khalid: { review: string };
    };
  };

  instagram: {
    title: string;
    subtitle: string;
    alt: string;
  };

  newsletter: {
    exclusive: string;
    title: string;
    description: string;
    placeholder: string;
    subscribe: string;
    thankYou: string;
    privacy: string;
  };

  search: {
    placeholder: string;
    mobilePlaceholder: string;
  };

  footer: {
    about: string;
    quickLinks: string;
    faq: string;
    shippingPolicy: string;
    returnsRefunds: string;
    privacyPolicy: string;
    termsOfService: string;
    customerService: string;
    trackOrder: string;
    giftCards: string;
    corporateOrders: string;
    contactInfo: string;
    address: string;
    hours: string;
    copyright: string;
  };

  cart: {
    title: string;
    empty: string;
    continueShopping: string;
    subtotal: string;
    deliveryFee: string;
    freeDelivery: string;
    total: string;
    checkout: string;
  };

  mobileNav: {
    occasions: string;
    account: string;
    signIn: string;
    myOrders: string;
    wishlist: string;
    settings: string;
    cart: string;
  };

  language: {
    en: string;
    ar: string;
  };
}
