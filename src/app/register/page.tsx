import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="shell grid min-h-screen place-items-center py-10">
      <AuthForm mode="register" />
    </main>
  );
}
