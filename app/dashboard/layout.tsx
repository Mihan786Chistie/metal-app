"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import metalLogo from "@/public/metalLogo.png";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 flex text-zinc-300">
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="p-6 border-b border-zinc-800 flex items-center space-x-4">
            <Image src={metalLogo} alt="Metal Logo" width={50} height={50} className="rounded-lg" />
            <h1 className="text-xl font-bold text-white tracking-tight">Metal</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Alerts
            </Link>
            <Link
              href="/dashboard/integrations"
              className="block px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Integrations
            </Link>
          </nav>
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
              }}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>
        <main className="flex-1 overflow-auto bg-zinc-950">{children}</main>
      </div>
    </AuthGuard>
  );
}
