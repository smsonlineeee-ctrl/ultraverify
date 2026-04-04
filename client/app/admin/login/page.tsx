"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Clear admin auth cookie when visiting the login page (acts as logout)    
    document.cookie = "admin-auth=; path=/; max-age=0";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isAdminLogin: true }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Set cookie for middleware
      document.cookie = "admin-auth=true; path=/; max-age=86400";
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">  
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">Admin Portal</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">Sign in to manage SMSOnline</p>
        
        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 rounded">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="email">Admin Email</label>
            <input 
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smsonline.com" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400" 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white font-medium transition"
          >
            Access Dashboard
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition">
            &larr; Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}