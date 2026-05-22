/**
 * Nav namespace — EN
 * Navigation, announcement bar, language toggle
 */
const nav = {
  dir: "ltr" as const,

  announcement: {
    text: "Free delivery over QAR 500",
  },

  nav: {
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    occasions: "Occasions",
    blog: "Blog",
    about: "About",
    contact: "Contact",
  },

  language: {
    en: "EN",
    ar: "عربي",
  },
};

export default nav;
