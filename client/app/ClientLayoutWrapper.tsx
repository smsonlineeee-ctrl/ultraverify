"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hide global navbar entirely for admin routes (or change it specifically)
  // since admin dashboard operates its own full-screen sidebar application.
  const isAdminRoute = pathname?.startsWith('/admin');
  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const shouldHideGlobalNavbar = isAdminRoute || isDashboardRoute;

  return (
    <>
      {!shouldHideGlobalNavbar && (
        <header className="fixed top-4 left-4 right-4 z-50 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-md mx-auto h-16 flex items-center max-w-7xl" style={{ marginBottom: "1.5rem" }}>
          <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="md:hidden text-gray-600 focus:outline-none flex items-center justify-center"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/" className="flex items-center gap-2">
                <img src="/logoultra1.jpeg" alt="Logo" className="h-10 md:h-14 w-auto object-contain rounded-md" />
              </Link>
            </div>
            
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

          {/* Mobile Nav Drawer */}
          {isMobileMenuOpen && (
             <div className="md:hidden fixed inset-0 z-[60] flex" style={{ margin: '-1rem' }}>
               <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
               <div className="relative flex flex-col w-64 max-w-[80%] bg-white h-[100vh] shadow-2xl transition-transform transform translate-x-0 overflow-y-auto">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                   <img src="/logoultra1.jpeg" alt="Logo" className="h-8 w-auto object-contain rounded-md" />
                   <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                     <X className="w-6 h-6" />
                   </button>
                 </div>
                 <nav className="flex flex-col p-4 gap-2 text-base font-medium text-gray-700">
                   <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-gray-50 rounded-lg">Pricing</Link>
                   <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                   <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-gray-50 rounded-lg">Login</Link>
                   <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 mt-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition">Sign up</Link>
                 </nav>
               </div>
             </div>
          )}
        </header>
      )}
      <div className={!shouldHideGlobalNavbar ? "" : ""}>{children}</div>
    </>
  );
}