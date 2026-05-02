"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    hostel: "",
    room: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role || "student",
          roomNumber: formData.room
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
      } else {
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
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#3366FF]/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-[#3366FF]/15 blur-2xl animate-pulse [animation-delay:1s]" />
          <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-[#4488FF]/10 blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10 max-w-md">
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
            Join the system,{" "}
            <span className="text-[#6699FF]">make your voice heard.</span>
          </h2>
          <p className="text-blue-200/70 text-lg leading-relaxed mb-10">
            Create your account to start filing complaints and tracking
            resolutions in real time.
          </p>

          <div className="space-y-4">
            {[
              { icon: "🏠", text: "Linked to your hostel & room" },
              { icon: "📊", text: "Track every complaint status" },
              { icon: "🔔", text: "Instant notifications on updates" },
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

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-white to-blue-50/40">
        <div className="w-full max-w-md">
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
              Create your account
            </h2>
            <p className="text-gray-500">
              Get started with DormFix in minutes
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Rajesh Kumar"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-12 bg-white border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-[#3366FF]/20 focus:border-[#3366FF] transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="signup-email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="signup-email"
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
              <Label
                htmlFor="signup-password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger
                    id="role-select"
                    className="h-12 bg-white border-gray-200 rounded-xl"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="warden">Warden</SelectItem>
                    <SelectItem value="department-head">
                      Department Head
                    </SelectItem>
                    <SelectItem value="dsw">DSW</SelectItem>
                    <SelectItem value="vice-chancellor">
                      Vice Chancellor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Hostel
                </Label>
                <Select
                  value={formData.hostel}
                  onValueChange={(val) =>
                    setFormData({ ...formData, hostel: val })
                  }
                >
                  <SelectTrigger
                    id="hostel-select"
                    className="h-12 bg-white border-gray-200 rounded-xl"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sapphire">Sapphire Hostel</SelectItem>
                    <SelectItem value="ruby">Ruby Hostel</SelectItem>
                    <SelectItem value="emerald">Emerald Hostel</SelectItem>
                    <SelectItem value="diamond">Diamond Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="room"
                className="text-sm font-medium text-gray-700"
              >
                Room Number
              </Label>
              <Input
                id="room"
                type="text"
                placeholder="e.g., 204"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                className="h-12 bg-white border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-[#3366FF]/20 focus:border-[#3366FF] transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#3366FF] hover:bg-[#2952cc] text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg shadow-[#3366FF]/25 hover:shadow-[#3366FF]/40 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#3366FF] hover:text-[#2952cc] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secured with institutional-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
