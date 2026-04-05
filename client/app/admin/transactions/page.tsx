"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminTransactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/transactions`);
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="w-full">
        <div className="max-w-7xl mx-auto text-sm">
          <div className="p-6 rounded-2xl shadow bg-white mb-8">
            <h1 className="text-2xl font-bold mb-1 text-gray-800">Transactions</h1>
            <p className="text-gray-500">Overview of user wallets, funding, and debits.</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by ID, email, or deposit name..."
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
                <div className="text-center py-6 text-gray-500">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No transactions found.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Details</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx: any) => (
                      <tr key={tx._id || tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-500">#{tx._id || tx.id}</td>
                        <td className="px-4 py-4 text-gray-800">{tx.email}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${tx.action === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {tx.action}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {tx.action === 'credit' ? `+${tx.creditAmount} via ${tx.bankOrDepositName}` : `-${tx.debitAmount} for ${tx.debitItem}`}
                        </td>
                        <td className="px-4 py-4 text-gray-500">{new Date(tx.time).toLocaleString()}</td>
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