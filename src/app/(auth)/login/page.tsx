import { Suspense } from "react";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your games on Cherry Chess"
    >
      <Suspense fallback={<p className="text-muted text-center text-sm">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
