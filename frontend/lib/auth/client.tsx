"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PublicUser } from "@/lib/db/types";

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: PublicUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // On mount, check localStorage for token and user
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as PublicUser;
        setState({ user, token, loading: false });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setState({ user: null, token: null, loading: false });
      }
    } else {
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  const login = (token: string, user: PublicUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setState({ user, token, loading: false });

    // Route based on role
    switch (user.role) {
      case "student":
        router.push("/student");
        break;
      case "warden":
        router.push("/warden");
        break;
      case "maintenance":
        router.push("/department-head");
        break;
      case "admin":
        // Distinguish VC from DSW if possible, or just default to VC
        // Let's check email or name if they distinguish, or assume /vice-chancellor
        if (user.email.includes("vc") || user.email.includes("vicechancellor") || user.email.includes("admin")) {
          router.push("/vice-chancellor");
        } else {
          router.push("/dsw");
        }
        break;
      default:
        router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({ user: null, token: null, loading: false });
    router.push("/login");
  };

  // Protect dashboard routes
  useEffect(() => {
    if (state.loading) return;

    const publicPaths = ["/", "/login", "/signup"];
    const isPublic = publicPaths.includes(pathname);

    if (!state.user && !isPublic) {
      // Not logged in, trying to access a protected route
      router.push("/login");
    }
  }, [state.user, state.loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Utility wrapper around `fetch` that automatically injects the Authorization header
 * and handles base URL configuration.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "API request failed";
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // Ignore JSON parse errors for non-JSON error responses
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
