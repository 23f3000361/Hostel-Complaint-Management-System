import type { Metadata } from "next";

import "./globals.css";

import { AuthProvider } from "@/lib/auth/client";

export const metadata: Metadata = {
  title: "TU Hostel Complaint Management System",
  description: "Hostel complaint management dashboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
