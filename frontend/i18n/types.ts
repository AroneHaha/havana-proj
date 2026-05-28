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

  checkout: {
    title: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    paymentMethod: string;
    cashOnDelivery: string;
    placeOrder: string;
    placing: string;
    stockWarning: string;
    stockUnavailable: string;
    stockUnavailableDetail: string;
    orderPlaced: string;
    orderPlacedMessage: string;
    orderNumber: string;
    continueShopping: string;
    loginRequired: string;
    loginRequiredMessage: string;
    goToLogin: string;
    invalidPhone: string;
    requiredField: string;
  };

  mobileNav: {
    occasions: string;
    account: string;
    signIn: string;
    myOrders: string;
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
      forgotPasswordTitle: string;
      forgotPasswordSubtitle: string;
      forgotPasswordSend: string;
      forgotPasswordSent: string;
      forgotPasswordBack: string;
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
      loginTagline: string;
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
      signupTagline: string;
      autoRedirectNotice: string;
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
      brandName: string;
      mainSection: string;
      topbarSubtitle: string;
    };
    notifications: {
      title: string;
      markAllRead: string;
      noNotifications: string;
      orderPlaced: string;
      orderPlacedDesc: string;
      orderCancelled: string;
      orderCancelledDesc: string;
      orderDelivered: string;
      orderDeliveredDesc: string;
      orderInTransit: string;
      orderInTransitDesc: string;
      orderProcessing: string;
      orderProcessingDesc: string;
      lowStock: string;
      lowStockDesc: string;
      newReview: string;
      newReviewDesc: string;
      justNow: string;
      minutesAgo: string;
      hoursAgo: string;
      yesterday: string;
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
      storeOverview: string;
      averageRating: string;
      pendingOrders: string;
      activeCount: string;
      inventoryAlerts: string;
      inventorySummary: string;
    };
    reviews: {
      title: string;
      subtitle: string;
      recentReviews: string;
      noReviews: string;
      noReviewsFound: string;
      customer: string;
      product: string;
      allProducts: string;
      rating: string;
      allRatings: string;
      star: string;
      stars: string;
      visibility: string;
      allStatuses: string;
      visible: string;
      hidden: string;
      pending: string;
      show: string;
      hide: string;
      clearFilters: string;
      searchPlaceholder: string;
      reviewsCount: string;
      averageRating: string;
      totalReviews: string;
      pendingReviews: string;
      outOf5: string;
      allTime: string;
      awaitingModeration: string;
      showing: string;
      deleteReview: string;
      deleteConfirm: string;
      cancel: string;
      delete: string;
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
      noTransactionsForPeriod: string;
      noReviews: string;
      noReviewsForProduct: string;
      reviewsFor: string;
      quantity: string;
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
      customDateRange: string;
      allYears: string;
      allMonths: string;
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
      editProductTitle: string;
      addProductTitle: string;
      saveChanges: string;
      cancel: string;
      productImages: string;
      productNameEn: string;
      productNameAr: string;
      priceKD: string;
      stockQuantity: string;
      salePriceKD: string;
      descriptionLabel: string;
      allCategories: string;
      photos: string;
      inStockLabel: string;
      noRatings: string;
      reviewsCount: string;
      tags: string;
      newTag: string;
      bestSellerTag: string;
      featuredTag: string;
      localeText: string;
      soldOutToggle: string;
      leaveEmptyDiscount: string;
      itemsSold: string;
      avgRating: string;
      reviewsLabel: string;
      revenue: string;
      noReviewsForProductDrawer: string;
      deleteConfirm: string;
      visible: string;
      hidden: string;
      pending: string;
    };
  };
}