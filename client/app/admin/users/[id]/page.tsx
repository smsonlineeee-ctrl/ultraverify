"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserDetails() {
  const params = useParams();
  const userId = params?.id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Balance modal state
  const [showModal, setShowModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [amountInput, setAmountInput] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!amountInput || isNaN(Number(amountInput))) {
      alert("Please enter a valid amount.");
      return;
    }
    setProcessLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountInput), action: balanceAction }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev: any) => ({ ...prev, balance: data.balance }));
        setShowModal(false);
        setAmountInput("");
      } else {
        alert("Failed to update balance");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating balance");
    } finally {
      setProcessLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${user?.status === "Suspended" ? "Activate" : "Suspend"} this user?`)) return;
    setProcessLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev: any) => ({ ...prev, status: data.status }));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    } finally {
      setProcessLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading user data...</p></div>;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-4">
        <p className="text-red-500 font-semibold">{error || "User not found"}</p>
        <Link href="/admin/users" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Return to Users</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Adjust Balance</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBalanceAction("add")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAction === "add" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  Add (+)
                </button>
                <button
                  onClick={() => setBalanceAction("subtract")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAction === "subtract" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                >
                  Deduct (-)
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                disabled={processLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                disabled={processLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {processLoading ? "Processing..." : "Confirm"}
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link href="/admin/users" className="text-blue-600 text-sm hover:underline mb-2 inline-block">&larr; Back to Users</Link>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleToggleStatus} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${user.status === "Suspended" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                disabled={processLoading}
              >
                {processLoading ? "Updating..." : user.status === "Suspended" ? "Activate User" : "Suspend User"}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100 col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Overview</h2>
              <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{user.displayName || user.name || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{user.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Joined Date</p>
                  <p className="text-gray-900">{new Date(user.joinedAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Status</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-semibold ${user.status === "Suspended" ? "text-red-700 bg-red-50" : "text-green-700 bg-green-50"}`}>
                    {user.status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100 flex flex-col justify-center items-center text-center">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Current Balance</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">₦{(user.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="flex gap-2 w-full max-w-[200px]">
                <button onClick={() => setShowModal(true)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium text-sm transition-colors">Adjust</button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Transaction History </h2>
            <div className="overflow-x-auto">
              {/* Transactions table placeholder dynamically querying soon. Currently shows blank array if empty. */}
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Details</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Later integrate real user transaction map here */}
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No transactions found for this user yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}