"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/dashboard-stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0 relative z-50">
        <Link href="/admin" className="text-xl font-bold text-gray-800">SMSAdmin</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 right-0 bg-white shadow-xl z-40 flex flex-col max-h-[calc(100vh-65px)] overflow-y-auto">
          <nav className="flex flex-col p-4 gap-1 text-sm font-medium">
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin" className="flex items-center px-4 py-3 bg-gray-100 text-gray-800 rounded-lg">Dashboard</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/users" className="flex items-center px-4 py-3 text-gray-500 rounded-lg">Users</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/transactions" className="flex items-center px-4 py-3 text-gray-500 rounded-lg">Transactions</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/orders" className="flex items-center px-4 py-3 text-gray-500 rounded-lg">All Orders</Link>
            <Link onClick={()=>setIsMobileMenuOpen(false)} href="/admin/settings" className="flex items-center px-4 py-3 text-gray-500 rounded-lg">Settings</Link>
            <button onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }} className="flex items-center px-4 py-3 text-red-500 font-bold mt-2 rounded-lg text-left">Log out</button>
          </nav>
        </div>
      )}

      <aside className="w-64 bg-white text-gray-800 hidden md:flex flex-col border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-xl font-bold text-gray-800">SMSAdmin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            Users
          </Link>
          <Link href="/admin/transactions" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            Transactions
          </Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            All Orders
          </Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            Settings
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => router.push('/login')} className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left hover:text-red-700 rounded-lg transition-colors">
              Log out
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <Link href="/admin/settings" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Settings</Link>
        </header>

        {loading ? (
          <div className="text-center py-10">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white text-gray-900">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Active Numbers</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeNumbers || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total User Balances</h3>
                <p className="text-3xl font-bold text-green-600">₦{(stats?.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-1">New Today</h3>
                <p className="text-3xl font-bold text-blue-600">+{stats?.newToday || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Transaction</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalTransaction || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Successful Orders</h3>
                <p className="text-3xl font-bold text-green-600">{stats?.successfulOrders || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Failed Orders</h3>
                <p className="text-3xl font-bold text-red-600">{stats?.failedOrders || 0}</p>
              </div>
            </div>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 text-gray-900">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold text-gray-800">Recent Users</h2>
                <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-medium">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Balance</th>
                      <th className="px-6 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats?.recentUsers?.map((u: any) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.displayName}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">₦{u.balance ? u.balance.toLocaleString() : '0'}</td>
                        <td className="px-6 py-4">{new Date(u.joinedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
