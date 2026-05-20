import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Join Cherry"
      subtitle="Create your account and start playing premium chess"
    >
      <SignupForm />
    </AuthShell>
  );
}
