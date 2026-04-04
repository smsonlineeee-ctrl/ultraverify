"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Users, DollarSign, Activity, FileText, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Do not show sidebar on admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0 relative z-50">
        <Link href="/admin" className="text-xl font-bold text-gray-800">SMSAdmin</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-64 max-w-[80%] bg-white h-full shadow-2xl transition-transform transform translate-x-0 overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">SMSAdmin</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                <X className="w-6 h-6" />
              </button>
            </div>
          <nav className="flex flex-col p-4 gap-1 text-sm font-medium">
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin" className={`flex items-center px-4 py-3 ${pathname === '/admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500'} rounded-lg`}>Dashboard</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/users" className={`flex items-center px-4 py-3 ${pathname.includes('/admin/users') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500'} rounded-lg`}>Users</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/transactions" className={`flex items-center px-4 py-3 ${pathname.includes('/admin/transactions') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500'} rounded-lg`}>Transactions</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/orders" className={`flex items-center px-4 py-3 ${pathname.includes('/admin/orders') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500'} rounded-lg`}>All Orders</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/settings" className={`flex items-center px-4 py-3 ${pathname.includes('/admin/settings') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500'} rounded-lg`}>Settings</Link>
            <button onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }} className="flex items-center px-4 py-3 text-red-500 font-bold mt-2 rounded-lg text-left">Log out</button>
          </nav>
        </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white text-gray-800 hidden md:flex flex-col border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-xl font-bold text-gray-800">SMSAdmin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className={`flex items-center px-4 py-2 ${pathname === '/admin' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg`}>Dashboard</Link>
          <Link href="/admin/users" className={`flex items-center px-4 py-2 ${pathname.includes('/admin/users') ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg`}>Users</Link>
          <Link href="/admin/transactions" className={`flex items-center px-4 py-2 ${pathname.includes('/admin/transactions') ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg`}>Transactions</Link>
          <Link href="/admin/orders" className={`flex items-center px-4 py-2 ${pathname.includes('/admin/orders') ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg`}>All Orders</Link>
          <Link href="/admin/settings" className={`flex items-center px-4 py-2 ${pathname.includes('/admin/settings') ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-100'} rounded-lg`}>Settings</Link>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => router.push('/login')} className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left hover:text-red-700 rounded-lg transition-colors">Log out</button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}