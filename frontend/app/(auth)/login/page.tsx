import { Suspense } from "react";
import { LoginPage } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In | Havana Flowers",
  description: "Sign in to your Havana Flowers account",
};

export default function LoginPageRoute() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
