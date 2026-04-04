"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Don't send isAdminLogin as true here, this is the regular user login
        body: JSON.stringify({ email, password, isAdminLogin: false }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Set cookie for middleware
      document.cookie = "user-auth=true; path=/; max-age=86400";
      // Store user info in localStorage for display
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/Nicebanner.jfif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 z-10 border border-white/20 mx-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">Welcome back</h1>
        <p className="text-gray-600 text-center mb-6 text-sm">Sign in to your dashboard to buy numbers and view SMS.</p>
        
        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 rounded">{error}</p>}
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-1 text-sm" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm" htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold transition">Sign in</button>
        </form>
        <div className="mt-5 text-center text-sm text-blue-600">
          Need an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </div>
        <div className="mt-2 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:underline">Home</Link>
        </div>
      </div>
    </div>
  );
}
