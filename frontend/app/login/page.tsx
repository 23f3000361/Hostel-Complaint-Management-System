"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, UserCircle2, Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/client";
import { ALLOWED_EMAIL_MESSAGE, isAllowedInstitutionEmail } from "@/lib/auth/email";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminFill = () => {
    setEmail("vicechancellor@tezu.ac.in");
    setPassword("vc@12345");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autofill") === "vc") {
      handleAdminFill();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isAllowedInstitutionEmail(email)) {
      setError(ALLOWED_EMAIL_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#1a2e6e]/80" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-blue-200">Sign in to TU Hostel Complaint Management System</p>
        </div>

        <Card className="border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleLogin} suppressHydrationWarning>
              {error && (
                <div className="rounded-xl bg-red-500/15 p-4 text-sm font-medium text-red-300 ring-1 ring-red-500/30">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@tezu.ernet.in"
                  required
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-slate-300 bg-white/60 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">Password</label>
                  <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-slate-300 bg-white/60 pl-4 pr-12 py-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-blue-600 text-base font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="mt-4">
                <Button
                  onClick={handleAdminFill}
                  variant="outline"
                  type="button"
                  className="h-12 w-full border-slate-600 bg-slate-800/60 text-white hover:bg-slate-700/60 hover:border-slate-500"
                >
                  <UserCircle2 className="mr-2 h-5 w-5" />
                  Fill VC Credentials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
