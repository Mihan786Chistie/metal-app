"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/join"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!token && !isPublicRoute) {
      router.replace("/login");
    } else if (token && isPublicRoute) {
      router.replace("/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
