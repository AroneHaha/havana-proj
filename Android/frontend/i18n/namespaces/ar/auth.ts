/**
 * Auth namespace — AR
 * تسجيل الدخول، إنشاء حساب، إعادة تعيين كلمة المرور، رسائل الخطأ
 */
const auth = {
  auth: {
    login: {
      title: "مرحباً بعودتك",
      subtitle: "سجّل الدخول إلى حسابك في هافانا فلاورز واستكشف أحدث مجموعاتنا",
      email: "البريد الإلكتروني",
      emailPlaceholder: "you@example.com",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      signIn: "تسجيل الدخول",
      orContinueWith: "أو تابع مع",
      noAccount: "ليس لديك حساب؟",
      createAccount: "أنشئ واحداً",
      requiredFields: "يرجى ملء جميع الحقول المطلوبة",
      invalidEmail: "يرجى إدخال بريد إلكتروني صالح",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
      welcomeBack: "مرحباً بعودتك إلى هافانا",
      sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
      networkError: "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.",
    },
    signup: {
      title: "انضم إلى هافانا",
      subtitle: "أنشئ حساباً للاستمتاع بعروض حصرية وتوصيات مخصصة",
      firstName: "الاسم الأول",
      firstNamePlaceholder: "اسمك الأول",
      lastName: "اسم العائلة",
      lastNamePlaceholder: "اسم عائلتك",
      email: "البريد الإلكتروني",
      emailPlaceholder: "you@example.com",
      password: "كلمة المرور",
      passwordPlaceholder: "أنشئ كلمة مرور",
      confirmPassword: "تأكيد كلمة المرور",
      confirmPasswordPlaceholder: "أكّد كلمة المرور",
      createAccount: "إنشاء حساب",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
      passwordMismatch: "كلمات المرور غير متطابقة",
      agreeToTerms: "بإنشاء حساب، أنت توافق على شروط الخدمة وسياسة الخصوصية",
      successTitle: "تم إنشاء الحساب!",
      successMessage: "تم إنشاء حسابك في هافانا فلاورز بنجاح. يمكنك الآن تسجيل الدخول والبدء في استكشاف مجموعاتنا الحصرية.",
      successGoToLogin: "سجّل الدخول الآن",
      emailAlreadyTaken: "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد مختلف أو تسجيل الدخول.",
      weakPassword: "كلمة المرور ضعيفة جداً. استخدم ٨ أحرف على الأقل مع مزيج من الحروف والأرقام والرموز.",
      passwordTooShort: "يجب أن تكون كلمة المرور ٨ أحرف على الأقل",
    },
  },
};

export default auth;