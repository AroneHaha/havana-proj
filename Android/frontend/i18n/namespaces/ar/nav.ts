/**
 * Nav namespace — AR
 * التنقل، شريط الإعلان، تبديل اللغة
 */
const nav = {
  dir: "rtl" as const,

  announcement: {
    text: "توصيل مجاني للطلبات فوق ٥٠٠ ريال",
  },

  nav: {
    home: "الرئيسية",
    shop: "المتجر",
    categories: "الفئات",
    occasions: "المناسبات",
    blog: "المدونة",
    about: "عنّا",
    contact: "اتصل بنا",
  },

  language: {
    en: "EN",
    ar: "عربي",
  },
};

export default nav;
