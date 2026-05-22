/**
 * Auth namespace — EN
 * Login, signup, password reset, error messages
 */
const auth = {
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
};

export default auth;
