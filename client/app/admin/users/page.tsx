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
      const res = await fetch("http://localhost:5000/api/admin/users");
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
        const res = await fetch(`http://localhost:5000/api/admin/users/${modal.user?._id}/balance`, {
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
    <div className="flex h-screen bg-gray-100">
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {modal.type === 'add' ? 'Add Balance' : 'Deduct Balance'} <span className="text-sm font-normal text-gray-500 block">for {modal.user?.displayName || modal.user?.email}</span>
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 text-gray-800"
              placeholder="Enter amount"
            />
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
              <button 
                onClick={handleAction} 
                className={`px-4 py-2 text-white rounded-lg font-medium ${modal.type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {modal.type === 'add' ? 'Add' : 'Minus'}
              </button>
            </div>
          </div>
        </div>
      )}
      <aside className="w-64 bg-white text-gray-800 hidden md:flex flex-col border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-xl font-bold text-gray-800">SMSAdmin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Dashboard</Link>
          <Link href="/admin/users" className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">Users</Link>
          <Link href="/admin/transactions" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Transactions</Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">All Orders</Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Settings</Link>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link href="/admin/logout" className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
              Log out
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
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
      </main>
    </div>
  );
}
