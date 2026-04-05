"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ displayName: "", email: "", phone: "", password: "", referral: "" });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Signup failed");
      
      // Auto-login after successful signup
      document.cookie = "user-auth=true; path=/; max-age=86400";
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Show success modal
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative py-12"
      style={{
        backgroundImage: "url('/Nicebanner.jfif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign up successful!</h2>
            <p className="text-gray-500 mb-6 w-64 text-center">Your account has been created. Redirecting to dashboard...</p>
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 z-10 border border-white/20 mx-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">Create your account</h1>
        <p className="text-gray-600 text-center mb-6 text-sm">Start buying temporary numbers and receiving SMS instantly.</p>
        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 rounded">{error}</p>}
        
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="displayName">Display name</label>
            <input id="displayName" type="text" onChange={handleChange} value={formData.displayName} autoComplete="name" required placeholder="Your name" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" onChange={handleChange} value={formData.email} autoComplete="email" required placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="phone">Phone number <span className="text-gray-500 font-normal">(Must be exactly 11 digits)</span></label>
            <input id="phone" type="tel" minLength={11} maxLength={11} onChange={handleChange} value={formData.phone} autoComplete="tel" required placeholder="08012345678" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="password">Password</label>
            <input id="password" type="password" onChange={handleChange} value={formData.password} autoComplete="new-password" required placeholder="At least 8 characters" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium" htmlFor="referral">Referral code <span className="text-gray-400 font-normal">(optional)</span></label>      
            <input id="referral" type="text" onChange={handleChange} value={formData.referral} placeholder="Enter a referral code" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition" />     
            <p className="text-xs text-gray-400 mt-1">If you were referred, paste the code here.</p>
          </div>
          <button type="submit" className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-sm hover:shadow transition">Create account</button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
