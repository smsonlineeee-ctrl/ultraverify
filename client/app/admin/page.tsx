"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
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
    <div className="w-full">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>  
          <Link href="/admin/settings" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Settings</Link>
        </header>

        {loading ? (
          <div className="text-center py-10">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="p-6 rounded-xl border border-transparent shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <h3 className="text-blue-100 text-xs font-medium mb-1 tracking-wider uppercase">Total Users</h3>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>  
              </div>
              <div className="p-6 rounded-xl border border-blue-50 bg-blue-50 shadow-sm text-gray-900">
                <h3 className="text-gray-500 text-xs font-medium mb-1 tracking-wider uppercase">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">₦{(stats?.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-xl border border-blue-50 bg-blue-50 shadow-sm text-gray-900">
                <h3 className="text-gray-500 text-xs font-medium mb-1 tracking-wider uppercase">Total Transaction</h3>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalTransaction || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase">Successful Orders</h3>
                <p className="text-3xl font-bold text-green-600">{stats?.successfulOrders || 0}</p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase">Failed Orders</h3>
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
      </div>
  );
}