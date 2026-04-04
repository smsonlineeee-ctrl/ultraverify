"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide global navbar entirely for admin routes (or change it specifically)
  // since admin dashboard operates its own full-screen sidebar application.
  const isAdminRoute = pathname?.startsWith('/admin');
  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const shouldHideGlobalNavbar = isAdminRoute || isDashboardRoute;

  return (
    <>
      {!shouldHideGlobalNavbar && (
        <header className="fixed top-4 left-4 right-4 z-50 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-md mx-4 h-16 flex items-center" style={{ marginBottom: "1.5rem" }}>
          <div className="container mx-auto px-6 flex justify-between items-center h-full">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logoultra1.jpeg" alt="Logo" className="h-14 w-auto object-contain rounded-md" />
            </Link>
            <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600">
              <Link href="#pricing" className="hover:text-blue-600 transition">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-blue-600 transition">
                Dashboard
              </Link>
              <Link href="/login" className="hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign up
              </Link>
            </nav>
          </div>
        </header>
      )}
      <div className={!shouldHideGlobalNavbar ? "" : ""}>{children}</div>
    </>
  );
}