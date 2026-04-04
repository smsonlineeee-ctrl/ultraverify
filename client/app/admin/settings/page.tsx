"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminSettings() {
  const [activeProvider, setActiveProvider] = useState<"daisy" | "hero">("daisy");
  const [exchangeRate, setExchangeRate] = useState<number>(1500);
  const [topUpPercentage, setTopUpPercentage] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        setActiveProvider(data.activeProvider || "daisy");
        setExchangeRate(data.exchangeRate || 1500);
        setTopUpPercentage(data.topUpPercentage || 10);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeProvider, exchangeRate, topUpPercentage })
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Error saving settings.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Example base price from provider in USD
  const basePriceUSD = 0.50;
  // Calculate final price: USD * ExchangeRate * (1 + TopUp/100)
  const finalPriceNGN = basePriceUSD * exchangeRate * (1 + topUpPercentage / 100);

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
          <Link href="/admin/orders" className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">All Orders</Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">Settings</Link>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link href="/admin/logout" className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
              Log out
            </Link>
          </div>
        </nav>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Provider</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select which SMS provider API to be active. All incoming requests for numbers and codes will be routed to the active provider.
            </p>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value as "daisy" | "hero")}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="daisy">Daisy SMS (daisysim.com)</option>
              <option value="hero">Hero SMS (hero-sms.com)</option>
            </select>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing Configuration & Exchange Rate</h2>
            <p className="text-sm text-gray-500 mb-4">
              Configure the baseline Dollar to Naira Exchange Rate and your Top-up Margin. Provider prices in USD will be converted to Naira using this rate, and your extra percentage will be added to generate your profit.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exchange Rate ($1 to ₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="2000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Top-up Percentage (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={topUpPercentage}
                    onChange={(e) => setTopUpPercentage(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Live Price Preview</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700">Base Mapping:</span>
                <span className="font-semibold text-blue-900">$1 = ₦{exchangeRate}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-blue-700">Example Output (if provider charges $0.50):</span>
                <span className="font-bold text-green-700">User pays ₦{finalPriceNGN.toFixed(2)}</span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Calculation: ($0.50 x ₦{exchangeRate}) + {topUpPercentage}% extra markup. The extra markup is your profit.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}