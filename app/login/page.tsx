"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      return fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        router.push("/dashboard");
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to login");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to Metal </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Don't have an account?{" "}
              <Link href="/join" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
