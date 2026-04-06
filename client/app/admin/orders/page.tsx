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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/orders`);
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
    <div className="w-full">
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
                    {orders.map((ord: any, idx: number) => (
                      <tr key={ord.id || ord._id || idx} className="hover:bg-gray-50"> 
                        <td className="px-4 py-3 font-medium text-gray-900">#{ord.id || ord._id}</td>
                        <td className="px-4 py-3 text-gray-600">{ord.email || ord.userEmail}</td>
                        <td className="px-4 py-3 font-mono">{ord.phone || ord.phoneNumber}</td>
                        <td className="px-4 py-3 uppercase">{ord.service}</td>
                        <td className="px-4 py-3">{ord.country}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{ord.price || ord.cost}</td>
                        <td className="px-4 py-3">
                          {ord.code || (ord.otp && ord.otp !== '-' ) ? (
                            <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{ord.code || ord.otp}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            (ord.status === 'Completed' || ord.code) ? 'bg-green-100 text-green-700' :
                            (ord.status === 'Cancelled' || ord.status === 'cancel') ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ord.code ? "Active (Received)" : (ord.status || 'Waiting')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{ord.provider || 'daisysim'}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(ord.date || ord.time || Date.now()).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
