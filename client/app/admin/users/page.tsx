"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/users`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const [modal, setModal] = useState<{ isOpen: boolean, type: 'add' | 'subtract' | null, user: any | null }>({ isOpen: false, type: null, user: null });
  const [amount, setAmount] = useState<string>('');

  const openModal = (type: 'add' | 'subtract', user: any) => {
    setModal({ isOpen: true, type, user });
    setAmount('');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, user: null });
    setAmount('');
  };

  const handleAction = async () => {
    const val = parseFloat(amount);
    if (!isNaN(val) && modal.user) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/users/${modal.user?._id}/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: val, action: modal.type })
        });
        
        if (res.ok) {
          fetchUsers(); // Refresh the users list
        }
      } catch (err) {
        console.error("Error updating balance:", err);
      }
    }
    closeModal();
  };

  return (
    <div className="w-full">
        <div className="max-w-6xl mx-auto text-sm">
          <div className="p-6 rounded-2xl shadow bg-white mb-8">
            <h1 className="text-lg font-semibold mb-1">User Management</h1>
            <p className="text-gray-500">Manage all users</p>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users by name, email  or phone....."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold">Add New User</button>
          </div>
          <div className="p-6 rounded-2xl shadow bg-white mb-4">
            <h2 className="font-semibold text-base mb-2">All Users (4353)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Balance</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.displayName}</div>
                        <div className="text-gray-400 text-xs text-ellipsis overflow-hidden">{u.email}</div>
                        <div className="text-gray-400 text-xs mb-1">{u.phone}</div>
                        <Link href={`/admin/users/${u._id}`} className="text-blue-600 text-xs underline">View</Link>
                      </td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded">active</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>₦{u.balance ? u.balance.toFixed(2) : '0.00'}</span>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => openModal('add', u)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-5 h-5 flex items-center justify-center rounded text-xs leading-none">+</button>
                            <button onClick={() => openModal('subtract', u)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-5 h-5 flex items-center justify-center rounded text-xs leading-none">-</button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{new Date(u.joinedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-semibold hover:bg-red-200">Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
