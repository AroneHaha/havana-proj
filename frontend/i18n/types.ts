/**
 * Base translation type using `string` for all text values.
 * Both en.ts and ar.ts satisfy this type.
 *
 * Product name/description entries are now `Record<string, ...>`
 * so that products can be added/removed from the DB without
 * needing to update this type file.
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
    /** Dynamic — products keyed by slug, fetched from DB */
    products: Record<string, { name: string; description: string }>;
  };

  bestSellers: {
    title: string;
    subtitle: string;
    /** Dynamic — products keyed by slug, fetched from DB */
    products: Record<string, { name: string; description: string }>;
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

  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      forgotPassword: string;
      signIn: string;
      orContinueWith: string;
      noAccount: string;
      createAccount: string;
      requiredFields: string;
      invalidEmail: string;
      invalidCredentials: string;
      welcomeBack: string;
      sessionExpired: string;
      networkError: string;
    };
    signup: {
      title: string;
      subtitle: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      createAccount: string;
      alreadyHaveAccount: string;
      signIn: string;
      passwordMismatch: string;
      agreeToTerms: string;
      successTitle: string;
      successMessage: string;
      successGoToLogin: string;
      emailAlreadyTaken: string;
      weakPassword: string;
      passwordTooShort: string;
    };
  };

  admin: {
    nav: {
      dashboard: string;
      orders: string;
      productsReviews: string;
      sales: string;
      customers: string;
      analytics: string;
      settings: string;
      signOut: string;
    };
    dashboard: {
      title: string;
      subtitle: string;
      totalRevenue: string;
      totalOrders: string;
      activeUsers: string;
      products: string;
      recentOrders: string;
      viewAll: string;
      order: string;
      customer: string;
      product: string;
      amount: string;
      status: string;
      delivered: string;
      inTransit: string;
      processing: string;
    };
    orders: {
      title: string;
      subtitle: string;
      search: string;
      all: string;
      pending: string;
      confirmed: string;
      preparing: string;
      outForDelivery: string;
      delivered: string;
      cancelled: string;
      noOrders: string;
      noOrdersStatus: string;
      orderID: string;
      customer: string;
      items: string;
      total: string;
      status: string;
      date: string;
      actions: string;
      viewDetails: string;
      deleteOrder: string;
      confirmDelete: string;
      orderDeleted: string;
      statusUpdated: string;
      orderDetails: string;
      orderInfo: string;
      customerInfo: string;
      orderItems: string;
      paymentMethod: string;
      deliveryFee: string;
      subtotal: string;
      notes: string;
      noNotes: string;
      cash: string;
      card: string;
      online: string;
      createdAt: string;
      updatedAt: string;
      qty: string;
      price: string;
      product: string;
      showing: string;
      exportCSV: string;
      markConfirmed: string;
      markPreparing: string;
      markOutForDelivery: string;
      markDelivered: string;
      cancelOrder: string;
      revenue: string;
      averageOrder: string;
      freeDelivery: string;
      prevPage: string;
      nextPage: string;
      page: string;
      confirmDeliveryTitle: string;
      confirmDeliveryMessage: string;
      confirmDeliveryWarning: string;
      confirmDeliveryBtn: string;
      cancelBtn: string;
      dateFrom: string;
      dateTo: string;
      clearDate: string;
      filterByDate: string;
      today: string;
      last7Days: string;
      last30Days: string;
    };
    salesReviews: {
      title: string;
      subtitle: string;
      search: string;
      totalRevenue: string;
      totalOrders: string;
      productsSold: string;
      allProducts: string;
      filterByProduct: string;
      filterByMonth: string;
      orderID: string;
      customer: string;
      products: string;
      total: string;
      date: string;
      status: string;
      actions: string;
      viewReviews: string;
      backToSales: string;
      saleDetails: string;
      orderInfo: string;
      pending: string;
      delivered: string;
      confirmed: string;
      preparing: string;
      outForDelivery: string;
      noSales: string;
      noSalesStatus: string;
      noReviews: string;
      noReviewsForProduct: string;
      reviewsFor: string;
      showing: string;
      all: string;
      filterByStatus: string;
      today: string;
      last7Days: string;
      last30Days: string;
      dateFrom: string;
      dateTo: string;
      clearDate: string;
      page: string;
    };
    products: {
      title: string;
      subtitle: string;
      search: string;
      all: string;
      inStock: string;
      lowStock: string;
      soldOut: string;
      noProducts: string;
      noProductsStatus: string;
      totalProducts: string;
      totalValue: string;
      lowStockCount: string;
      outOfStockCount: string;
      productName: string;
      sku: string;
      category: string;
      price: string;
      stock: string;
      status: string;
      rating: string;
      date: string;
      actions: string;
      viewDetails: string;
      editProduct: string;
      deleteProduct: string;
      productDetails: string;
      productInfo: string;
      description: string;
      images: string;
      backToProducts: string;
      addProduct: string;
      showing: string;
      page: string;
    };
  };
}