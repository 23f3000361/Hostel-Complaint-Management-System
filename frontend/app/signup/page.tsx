"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/client";
import { ALLOWED_EMAIL_MESSAGE, isAllowedInstitutionEmail } from "@/lib/auth/email";

interface Hostel {
  hostel_id: string;
  hostel_name: string;
  location: string;
}

interface Department {
  dept_id: string;
  dept_name: string;
}

export default function SignupPage() {
  const { login } = useAuth();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [tenureSince, setTenureSince] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch hostels on mount
  useEffect(() => {
    fetch("/api/hostels")
      .then(res => res.json())
      .then(data => {
        if (data.hostels) setHostels(data.hostels);
      })
      .catch(console.error);
  }, []);

  // Fetch departments on mount
  useEffect(() => {
    fetch("/api/departments")
      .then(res => res.json())
      .then(data => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch(console.error);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "student" && !hostelId) {
      setError("Please select your hostel.");
      setLoading(false);
      return;
    }

    if (role === "maintenance" && !deptId) {
      setError("Please select your department.");
      setLoading(false);
      return;
    }

    if (!isAllowedInstitutionEmail(email)) {
      setError(ALLOWED_EMAIL_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          hostel_id: role === "student" || role === "warden" ? hostelId || null : null,
          dept_id: role === "maintenance" ? deptId || null : null,
          tenure_since: role === "student" ? tenureSince || null : null,
          room_number: role === "student" ? roomNumber || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate tenure month options (last 5 years)
  const tenureOptions: { value: string; label: string }[] = [];
  const now = new Date();
  for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
    const months = y === now.getFullYear() ? now.getMonth() + 1 : 12;
    for (let m = months; m >= 1; m--) {
      const monthName = new Date(y, m - 1).toLocaleString("default", { month: "long" });
      tenureOptions.push({ value: `${y}-${String(m).padStart(2, "0")}`, label: `${monthName} ${y}` });
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white/60 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f172a] to-emerald-900/40" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="mt-2 text-emerald-200">Join TU Hostel Complaint Management System</p>
        </div>

        <Card className="border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            <form className="space-y-5" onSubmit={handleSignup} suppressHydrationWarning>
              {error && (
                <div className="rounded-xl bg-red-500/15 p-4 text-sm font-medium text-red-300 ring-1 ring-red-500/30">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Select Role</label>
                <Select value={role} onValueChange={(v: string) => { setRole(v); setHostelId(""); setDeptId(""); }}>
                  <SelectTrigger className="h-12 border-slate-300 bg-white/60 text-slate-900">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-300 bg-slate-800 text-white">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="warden">Warden</SelectItem>
                    <SelectItem value="maintenance">Department Head</SelectItem>
                    <SelectItem value="dsw">DSW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic hostel dropdown for Student and Warden */}
              {(role === "student" || role === "warden") && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    {role === "student" ? "Your Hostel" : "Assigned Hostel"}
                  </label>
                  <Select value={hostelId} onValueChange={setHostelId}>
                    <SelectTrigger className="h-12 border-slate-300 bg-white/60 text-slate-900">
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300 bg-slate-800 text-white">
                      {hostels.length === 0 ? (
                        <SelectItem value="__loading" disabled>Loading hostels...</SelectItem>
                      ) : (
                        hostels.map(h => (
                          <SelectItem key={h.hostel_id} value={h.hostel_id}>
                            {h.hostel_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dynamic tenure since for Student */}
              {role === "student" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Resident Since</label>
                  <Select value={tenureSince} onValueChange={setTenureSince}>
                    <SelectTrigger className="h-12 border-slate-300 bg-white/60 text-slate-900">
                      <SelectValue placeholder="When did you join?" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56 border-slate-300 bg-slate-800 text-white">
                      {tenureOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Room Number Input for Student */}
              {role === "student" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Room Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 204"
                    required
                    suppressHydrationWarning
                    className={inputClass}
                  />
                </div>
              )}

              {/* Dynamic department dropdown for Department Head */}
              {role === "maintenance" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Your Department</label>
                  <Select value={deptId} onValueChange={setDeptId}>
                    <SelectTrigger className="h-12 border-slate-300 bg-white/60 text-slate-900">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300 bg-slate-800 text-white">
                      {departments.length === 0 ? (
                        <SelectItem value="__loading" disabled>Loading departments...</SelectItem>
                      ) : (
                        departments.map(d => (
                          <SelectItem key={d.dept_id} value={d.dept_id}>
                            {d.dept_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  suppressHydrationWarning
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@tezu.ernet.in"
                  required
                  suppressHydrationWarning
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-slate-300 bg-white/60 pl-4 pr-12 py-3 text-slate-900 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors"
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
                className="h-12 w-full bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
