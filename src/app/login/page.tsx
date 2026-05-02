"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
      } else {
        // Save token and redirect
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Cannot connect to the server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#1e2a4a] via-[#263660] to-[#1a2540] items-center justify-center p-12">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#3366FF]/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-[#3366FF]/15 blur-2xl animate-pulse [animation-delay:1s]" />
          <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-[#4488FF]/10 blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-[#3366FF] flex items-center justify-center shadow-lg shadow-[#3366FF]/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                DormFix
              </h1>
              <p className="text-sm text-blue-300/80">
                Institutional Clock System
              </p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Resolve hostel issues,{" "}
            <span className="text-[#6699FF]">faster than ever.</span>
          </h2>
          <p className="text-blue-200/70 text-lg leading-relaxed mb-10">
            File complaints, track resolutions in real time, and hold
            institutions accountable with our shared clock system.
          </p>

          {/* Feature pills */}
          <div className="space-y-4">
            {[
              { icon: "⏱", text: "Shared Institutional Clock" },
              { icon: "📋", text: "Real-time Complaint Tracking" },
              { icon: "🔗", text: "Evidence Chain Verification" },
            ].map((feat) => (
              <div
                key={feat.text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-xl">{feat.icon}</span>
                <span className="text-blue-100 font-medium">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-white to-blue-50/40">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-[#3366FF] flex items-center justify-center shadow-lg shadow-[#3366FF]/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DormFix</h1>
              <p className="text-xs text-gray-500">
                Institutional Clock System
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-12 bg-white border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-[#3366FF]/20 focus:border-[#3366FF] transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#3366FF] hover:text-[#2952cc] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 bg-white border-gray-200 rounded-xl px-4 pr-12 focus:ring-2 focus:ring-[#3366FF]/20 focus:border-[#3366FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#3366FF] hover:bg-[#2952cc] text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg shadow-[#3366FF]/25 hover:shadow-[#3366FF]/40 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#3366FF] hover:text-[#2952cc] font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Security badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secured with institutional-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
