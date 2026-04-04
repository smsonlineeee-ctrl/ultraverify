"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/orders");
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white text-gray-800 hidden md:flex flex-col border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-xl font-bold text-gray-800">SMSAdmin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Dashboard</Link>
          <Link href="/admin/users" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Users</Link>
          <Link href="/admin/transactions" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Transactions</Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">All Orders</Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Settings</Link>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => router.push('/login')} className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left hover:text-red-700 rounded-lg transition-colors">    
              Log out
            </button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto text-sm">
          <div className="p-6 rounded-2xl shadow bg-white mb-8">
            <h1 className="text-2xl font-bold mb-1 text-gray-800">All Orders</h1>
            <p className="text-gray-500">Track all phone number purchases and OTP requests.</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search orders by ID, email, or phone number..."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs pl-10"     
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
            </div>
            <button className="bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold">Filter</button>
          </div>

          <div className="p-6 rounded-2xl shadow bg-white mb-4">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-6 text-gray-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No orders found.</div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">    
                  <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Order ID</th>        
                      <th className="px-4 py-3 font-semibold">User Email</th>     
                      <th className="px-4 py-3 font-semibold">Phone Number Bought</th>
                      <th className="px-4 py-3 font-semibold">Service</th>        
                      <th className="px-4 py-3 font-semibold">Country</th>        
                      <th className="px-4 py-3 font-semibold">Cost</th>
                      <th className="px-4 py-3 font-semibold">OTP</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Provider</th>       
                      <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord: any) => (
                      <tr key={ord._id || ord.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">#{ord._id || ord.id}</td>
                        <td className="px-4 py-3 text-gray-600">{ord.userEmail}</td>
                        <td className="px-4 py-3 font-mono">{ord.phoneNumber}</td>
                        <td className="px-4 py-3">{ord.service}</td>
                        <td className="px-4 py-3">{ord.country}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">₦{ord.cost}</td>
                        <td className="px-4 py-3">
                          {ord.otp && ord.otp !== '-' ? (
                            <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{ord.otp}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            ord.status === 'received' ? 'bg-green-100 text-green-700' : 
                            ord.status === 'cancel' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{ord.provider}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(ord.time).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
