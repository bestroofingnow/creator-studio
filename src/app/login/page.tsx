"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const signup = searchParams.get("signup");

    if (signup === "true") {
      router.replace(`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else {
      router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--neon-cyan)]" />
    </div>
  );
}

// Redirect from old /login to new auth pages
export default function LoginRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--neon-cyan)]" />
        </div>
      }
    >
      <LoginRedirectContent />
    </Suspense>
  );
}
