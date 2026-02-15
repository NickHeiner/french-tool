import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/");
  }

  const { next } = await searchParams;

  return (
    <main>
      <LoginForm nextPath={next} />
    </main>
  );
}
