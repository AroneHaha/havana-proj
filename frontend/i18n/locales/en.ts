import type { Translation } from "../types";

const en: Translation = {
  // Direction
  dir: "ltr",

  // Announcement bar
  announcement: {
    text: "Free delivery over QAR 500",
  },

  // Navigation
  nav: {
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    occasions: "Occasions",
    blog: "Blog",
    about: "About",
    contact: "Contact",
  },

  // Occasions
  occasions: {
    eid: "Eid",
    weddings: "Weddings",
    birthday: "Birthday",
    anniversary: "Anniversary",
    graduation: "Graduation",
    mothersDay: "Mother's Day",
    loveRomance: "Love & Romance",
    sympathy: "Sympathy",
  },

  // Hero
  hero: {
    badge: "Qatar's Premier Floral Boutique",
    title: "Luxury Floral Artistry",
    description:
      "Experience the finest flower arrangements crafted with passion and elegance for every special moment in Qatar.",
    shopCollection: "Shop Collection",
    customOrders: "Custom Orders",
    scroll: "Scroll",
  },

  // Shop by Occasion
  shopByOccasion: {
    title: "Shop by Occasion",
    subtitle: "Find the perfect arrangement for every celebration",
  },

  // Why Choose Us
  whyChooseUs: {
    title: "Why Choose Havana Flowers",
    subtitle: "We deliver excellence with every petal",
    sameDay: {
      title: "Same-Day Delivery",
      description:
        "Order before 2 PM and receive your flowers the very same day across Qatar.",
    },
    freshness: {
      title: "7-Day Freshness",
      description:
        "Our flowers stay fresh and vibrant for a minimum of 7 days guaranteed.",
    },
    premium: {
      title: "Premium Quality",
      description:
        "Hand-selected blooms sourced from the world's finest flower farms.",
    },
    support: {
      title: "24/7 Support",
      description:
        "Round-the-clock customer service for all your floral needs.",
    },
    personalized: {
      title: "Personalized Touch",
      description:
        "Custom arrangements tailored to your exact preferences and vision.",
    },
    eco: {
      title: "Eco-Conscious",
      description:
        "Sustainable packaging and eco-friendly practices at every step.",
    },
  },

  // Featured Collection
  featuredCollection: {
    title: "Featured Collection",
    subtitle: "Handpicked selections from our master florists",
    products: {
      royalRose: {
        name: "Royal Rose Symphony",
        description: "Luxurious red roses arrangement",
      },
      goldenHour: {
        name: "Golden Hour Bouquet",
        description: "Sunflowers and gold accents",
      },
      midnightOrchid: {
        name: "Midnight Orchid Elegance",
        description: "Exotic orchids in dark vase",
      },
      pearlLilies: {
        name: "Pearl White Lilies",
        description: "Elegant white lily arrangement",
      },
    },
  },

  // Best Sellers
  bestSellers: {
    title: "Best Sellers",
    subtitle: "Most loved arrangements by our customers",
    products: {
      classicRed: {
        name: "Classic Red Rose Box",
        description: "24 premium red roses in luxury box",
      },
      pastelDream: {
        name: "Pastel Dream Arrangement",
        description: "Soft pastel floral arrangement",
      },
      tulipParadise: {
        name: "Tulip Paradise",
        description: "Colorful tulip bouquet",
      },
      luxuryWhiteGold: {
        name: "Luxury White & Gold",
        description: "White roses with gold accents",
      },
    },
  },

  // Product Card
  productCard: {
    addToCart: "Add to Cart",
    bestSeller: "Best Seller",
    new: "New",
  },

  // Testimonials
  testimonials: {
    title: "What Our Customers Say",
    subtitle: "Real reviews from our valued customers",
    reviews: {
      ahmad: {
        review:
          "Absolutely stunning arrangement! The roses were fresh and the delivery was right on time for our anniversary. Havana Flowers exceeded all expectations. Will definitely order again!",
      },
      sara: {
        review:
          "I ordered the wedding package and everything was perfect. The attention to detail was remarkable. My guests couldn't stop complimenting the floral decorations!",
      },
      khalid: {
        review:
          "Excellent quality flowers and the same-day delivery saved me! The customer service team was incredibly helpful in choosing the right arrangement for Mother's Day.",
      },
    },
  },

  // Instagram Gallery
  instagram: {
    title: "Follow Us on Instagram",
    subtitle: "@havanaflowers.qa",
    alt: "Havana Flowers Instagram",
  },

  // Newsletter
  newsletter: {
    exclusive: "Exclusive",
    title: "Stay in Bloom",
    description:
      "Subscribe to receive exclusive offers, new arrivals, and floral inspiration.",
    placeholder: "Enter your email address",
    subscribe: "Subscribe",
    thankYou: "Thank you for subscribing!",
    privacy: "By subscribing, you agree to our Privacy Policy.",
  },

  // Search
  search: {
    placeholder: "Search flowers, arrangements...",
    mobilePlaceholder: "Search flowers...",
  },

  // Footer
  footer: {
    about:
      "Havana Flowers is Qatar's premier luxury floral boutique, delivering exquisite arrangements crafted with passion and precision since 2018.",
    quickLinks: "Quick Links",
    faq: "FAQ",
    shippingPolicy: "Shipping Policy",
    returnsRefunds: "Returns & Refunds",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    customerService: "Customer Service",
    trackOrder: "Track Order",
    giftCards: "Gift Cards",
    corporateOrders: "Corporate Orders",
    contactInfo: "Contact Info",
    address: "The Pearl-Qatar, Porto Arabia, Doha, Qatar",
    hours: "Sat-Thu: 9AM - 10PM",
    copyright: "Havana Flowers. All rights reserved.",
  },

  // Cart
  cart: {
    title: "Your Cart",
    empty: "Your cart is empty",
    continueShopping: "Continue Shopping",
    subtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    freeDelivery: "Free Delivery",
    total: "Total",
    checkout: "Proceed to Checkout",
  },

  // Mobile Nav
  mobileNav: {
    occasions: "Occasions",
    account: "Account",
    signIn: "Sign In",
    myOrders: "My Orders",
    wishlist: "Wishlist",
    settings: "Settings",
    cart: "Cart",
  },

  // Language
  language: {
    en: "EN",
    ar: "عربي",
  },

  // Auth
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your Havana Flowers account and explore our latest collections",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      orContinueWith: "Or continue with",
      noAccount: "Don't have an account?",
      createAccount: "Create one",
      requiredFields: "Please fill in all required fields",
      invalidEmail: "Please enter a valid email address",
      invalidCredentials: "Invalid email or password. Please try again.",
      welcomeBack: "Welcome back to Havana",
      sessionExpired: "Your session has expired. Please sign in again.",
      networkError: "Unable to connect to the server. Please check your internet connection.",
    },
    signup: {
      title: "Join Havana",
      subtitle: "Create an account to enjoy exclusive offers and personalized recommendations",
      firstName: "First Name",
      firstNamePlaceholder: "Your first name",
      lastName: "Last Name",
      lastNamePlaceholder: "Your last name",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Create a password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      createAccount: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign In",
      passwordMismatch: "Passwords do not match",
      agreeToTerms: "By creating an account, you agree to our Terms of Service and Privacy Policy",
      successTitle: "Account Created!",
      successMessage: "Your Havana Flowers account has been created successfully. You can now sign in and start exploring our exclusive collections.",
      successGoToLogin: "Sign In Now",
      emailAlreadyTaken: "This email is already registered. Please use a different email or sign in.",
      weakPassword: "Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.",
      passwordTooShort: "Password must be at least 8 characters",
    },
  },

  // Admin
  admin: {
    nav: {
      dashboard: "Dashboard",
      orders: "Orders",
      productsReviews: "Products & Reviews",
      sales: "Sales",
      customers: "Customers",
      analytics: "Analytics",
      settings: "Settings",
      signOut: "Sign Out",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Welcome back, {name}. Here's your store overview.",
      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      activeUsers: "Active Users",
      products: "Products",
      recentOrders: "Recent Orders",
      viewAll: "View All",
      order: "Order",
      customer: "Customer",
      product: "Product",
      amount: "Amount",
      status: "Status",
      delivered: "Delivered",
      inTransit: "In Transit",
      processing: "Processing",
      storeOverview: "Store Overview",
      averageRating: "Average Rating",
      pendingOrders: "Pending Orders",
      activeCount: "{count} active",
      inventoryAlerts: "Inventory Alerts",
      inventorySummary: "{lowCount} low stock, {outCount} out of stock",
    },
    reviews: {
      title: "Reviews",
      subtitle: "Manage and moderate customer reviews",
      recentReviews: "Recent Reviews",
      noReviews: "No reviews yet",
      customer: "Customer",
      product: "Product",
      rating: "Rating",
      visibility: "Visibility",
      averageRating: "Average Rating",
      totalReviews: "Total Reviews",
      pendingReviews: "Pending Reviews",
      outOf5: "out of 5.0",
      allTime: "All time",
      awaitingModeration: "Awaiting moderation",
      showing: "Showing {count} reviews",
      deleteReview: "Delete Review",
      deleteConfirm: "Are you sure you want to delete this review? This action cannot be undone.",
      cancel: "Cancel",
      delete: "Delete",
    },
    orders: {
      title: "Orders",
      subtitle: "Manage and track all customer orders",
      search: "Search orders by ID, customer, or email...",
      all: "All",
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      noOrders: "No orders found",
      noOrdersStatus: "No {status} orders",
      orderID: "Order ID",
      customer: "Customer",
      items: "Items",
      total: "Total",
      status: "Status",
      date: "Date",
      actions: "Actions",
      viewDetails: "View Details",
      deleteOrder: "Delete Order",
      confirmDelete: "Are you sure you want to delete order #{id}? This action cannot be undone.",
      orderDeleted: "Order deleted successfully",
      statusUpdated: "Order status updated to {status}",
      orderDetails: "Order Details",
      orderInfo: "Order Information",
      customerInfo: "Customer Information",
      orderItems: "Order Items",
      paymentMethod: "Payment Method",
      deliveryFee: "Delivery Fee",
      subtotal: "Subtotal",
      notes: "Notes",
      noNotes: "No notes",
      cash: "Cash on Delivery",
      card: "Credit Card",
      online: "Online Payment",
      createdAt: "Created",
      updatedAt: "Last Updated",
      qty: "Qty",
      price: "Price",
      product: "Product",
      showing: "Showing {count} of {total} orders",
      exportCSV: "Export CSV",
      markConfirmed: "Mark Confirmed",
      markPreparing: "Mark Preparing",
      markOutForDelivery: "Mark Out for Delivery",
      markDelivered: "Mark Delivered",
      cancelOrder: "Cancel Order",
      revenue: "Revenue",
      averageOrder: "Avg Order",
      freeDelivery: "Free",
      prevPage: "Previous",
      nextPage: "Next",
      page: "Page {current} of {total}",
      confirmDeliveryTitle: "Confirm Delivery",
      confirmDeliveryMessage: "Are you sure you want to mark order #{id} as delivered?",
      confirmDeliveryWarning: "This action cannot be undone. The order status will be permanently set to delivered.",
      confirmDeliveryBtn: "Yes, Mark as Delivered",
      cancelBtn: "Cancel",
      dateFrom: "From",
      dateTo: "To",
      clearDate: "Clear",
      filterByDate: "Filter by Date",
      today: "Today",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
    },
    salesReviews: {
      title: "Sales",
      subtitle: "Track completed sales and customer reviews",
      search: "Search sales by ID or customer...",
      totalRevenue: "Total Revenue (This Month)",
      totalOrders: "Total Orders (Today)",
      productsSold: "Products Sold",
      allProducts: "All Products",
      filterByProduct: "Filter by Product",
      filterByMonth: "Filter by Month",
      orderID: "Order ID",
      customer: "Customer",
      products: "Products",
      total: "Total",
      date: "Date",
      status: "Status",
      actions: "Actions",
      viewReviews: "View Reviews",
      backToSales: "Back to Sales",
      saleDetails: "Sale Details",
      orderInfo: "Order Information",
      pending: "Pending",
      delivered: "Delivered",
      confirmed: "Confirmed",
      preparing: "Preparing",
      outForDelivery: "Out for Delivery",
      noSales: "No sales found",
      noSalesStatus: "No {status} sales",
      noTransactionsForPeriod: "No transactions found for this period.",
      noReviews: "No reviews found",
      noReviewsForProduct: "No reviews yet for this product",
      reviewsFor: "Reviews for",
      showing: "Showing {count} of {total} sales",
      all: "All",
      filterByStatus: "Filter by Status",
      today: "Today",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      dateFrom: "From",
      dateTo: "To",
      clearDate: "Clear",
      page: "Page {current} of {total}",
    },
    products: {
      title: "Products",
      subtitle: "Manage your product catalog and inventory",
      search: "Search products by name, SKU, or category...",
      all: "All",
      inStock: "In Stock",
      lowStock: "Low Stock",
      soldOut: "Sold Out",
      noProducts: "No products found",
      noProductsStatus: "No {status} products",
      totalProducts: "Total Products",
      totalValue: "Total Value",
      lowStockCount: "Low Stock",
      outOfStockCount: "Out of Stock",
      productName: "Product Name",
      sku: "SKU",
      category: "Category",
      price: "Price",
      stock: "Stock",
      status: "Status",
      rating: "Rating",
      date: "Date Added",
      actions: "Actions",
      viewDetails: "View Details",
      editProduct: "Edit",
      deleteProduct: "Delete",
      productDetails: "Product Details",
      productInfo: "Product Information",
      description: "Description",
      images: "Images",
      backToProducts: "Back to Products",
      addProduct: "Add Product",
      showing: "Showing {count} of {total} products",
      page: "Page {current} of {total}",
    },
  },
};

export default en;