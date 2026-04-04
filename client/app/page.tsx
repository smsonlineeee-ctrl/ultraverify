import Link from "next/link";
import { ArrowRight, Globe, ShoppingCart, Smartphone, MessageSquare, CreditCard, Lock, List, RefreshCw } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "Real-time SMS delivery",
      desc: "Receive verification codes inside your dashboard with fast refresh.",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      title: "Wallet-powered checkout",
      desc: "Fund your wallet and buy numbers in one simple flow.",
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: "Secure sessions",
      desc: "Your account stays protected with modern authentication.",
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Country + service selection",
      desc: "Pick a country and service (WhatsApp, Telegram, X, and more).",
    },
    {
      icon: <List className="w-6 h-6 text-blue-600" />,
      title: "Clean order history",
      desc: "Track purchased numbers, SMS delivery, and order status in one place.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
      title: "Control your activations",
      desc: "Refresh SMS, cancel orders, and manage activation lifecycle.",
    },
  ];

  const pricingData = [
    { country: "Russia", service: "AOL", price: "24.00" },
    { country: "Ukraine", service: "GMX", price: "24.00" },
    { country: "Ukraine", service: "LinkedIn", price: "24.00" },
    { country: "Ukraine", service: "Discord", price: "24.00" },
    { country: "Ukraine", service: "AOL", price: "24.00" },
    { country: "Kazakhstan", service: "Grindr", price: "24.00" },
    { country: "Kazakhstan", service: "GMX", price: "24.00" },
    { country: "Kazakhstan", service: "Rambler", price: "24.00" },
    { country: "Kazakhstan", service: "TikTok", price: "24.00" },
    { country: "Kazakhstan", service: "LinkedIn", price: "24.00" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative w-full pt-32 pb-24 px-6 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden rounded-b-[2.5rem] shadow-2xl"
          style={{
            backgroundImage: "url('/Nicebanner.jfif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

          {/* Left: Hero Text */}
          <div className="relative z-10 flex-1 text-center md:text-left md:pl-8">
            <div className="inline-block mb-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-medium tracking-wide shadow-sm">
              ✨ The ultimate SMS verification platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight drop-shadow-lg">
              <span className="text-white">Instant virtual numbers</span><br/>
              <span className="text-blue-400">for SMS verification</span>
            </h1>
            <p className="text-base md:text-xl text-gray-200 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed font-light drop-shadow">
              Select a country & service, buy a number instantly, and receive the SMS code directly in your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5"
              >
                Get started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-all shadow-lg hover:-translate-y-0.5"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
          
          {/* Right: How it works banners */}
          <div className="relative z-10 flex-1 flex flex-col gap-5 mt-14 md:mt-0 md:ml-8 max-w-[420px] w-full">
            {/* Banner 1 */}
            <div className="flex flex-col items-start gap-2 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3 mb-0">
                <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Globe className="w-5 h-5 text-blue-300" />
                </span>
                <h3 className="text-base font-semibold text-white mb-0 drop-shadow-sm">1. Pick a country + service</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-0 pl-[52px]">Browse through 150+ countries and thousands of services.</p>
            </div>
            {/* Banner 2 */}
            <div className="flex flex-col items-start gap-2 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3 mb-0">
                <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-inner">
                  <ShoppingCart className="w-5 h-5 text-blue-300" />
                </span>
                <h3 className="text-base font-semibold text-white mb-0 drop-shadow-sm">2. Buy with wallet</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-0 pl-[52px]">Use your wallet balance to instantly purchase numbers.</p>
            </div>
            {/* Banner 3 */}
            <div className="flex flex-col items-start gap-2 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3 mb-0">
                <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Smartphone className="w-5 h-5 text-blue-300" />
                </span>
                <h3 className="text-base font-semibold text-white mb-0 drop-shadow-sm">3. Receive SMS</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-0 pl-[52px]">Get your verification code instantly in the dashboard.</p>
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto space-y-32">
          {/* Feature 1: Image Left, Text Right (or alternating based on flex logic) */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 relative w-full group">
              <div className="absolute inset-0 bg-blue-200 rounded-[2.5rem] blur-[30px] opacity-40 group-hover:opacity-60 transition duration-500 transform translate-x-4 translate-y-6"></div>
              <img src="/dedicated.jfif" alt="Receive Virtual Numbers" className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border border-white object-cover aspect-[4/3] transform transition-transform duration-500 group-hover:-translate-y-2" />
            </div>
            <div className="flex-1 space-y-6 md:pr-10">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold tracking-wide uppercase shadow-sm">Global Network</div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Get dedicated virtual numbers instantly</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                Choose from hundreds of countries with our premium network. Get high-quality, reliable numbers specifically tailored for seamless online verification processes.
              </p>
              <div className="h-px w-16 bg-gray-200 my-6"></div>
              <ul className="space-y-4 text-gray-700 font-medium">
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">✓</div>
                  Real mobile carrier networks
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">✓</div>
                  Fresh stock updated multiple times daily
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">✓</div>
                  Compatible with thousands of services
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Text Left, Image Right */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
             <div className="flex-1 relative w-full group">
              <div className="absolute inset-0 bg-indigo-200 rounded-[2.5rem] blur-[30px] opacity-40 group-hover:opacity-60 transition duration-500 transform -translate-x-4 translate-y-6"></div>
              <img src="/otp.jfif" alt="Instant OTP Code Delivery" className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border border-white object-cover aspect-[4/3] transform transition-transform duration-500 group-hover:-translate-y-2" />
            </div>
            <div className="flex-1 space-y-6 md:pl-10">
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase shadow-sm">Lightning Fast</div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Bypass verifications with fast OTP delivery</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                No more waiting around. Once your selected service sends the confirmation code, our system intercepts and streams it immediately to your dashboard. Skip the friction effortlessly.
              </p>
              <div className="h-px w-16 bg-gray-200 my-6"></div>
              <ul className="space-y-4 text-gray-700 font-medium">
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">✓</div>
                  Real-time message streaming
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">✓</div>
                  Easy extraction and one-click copy
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">✓</div>
                  Only pay for successfully delivered codes
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-8 md:py-12">
          <div className="mb-16 text-center md:text-left px-4 md:px-12">
            <h2 className="text-3xl font-bold mb-4">Built for speed</h2>
            <p className="text-gray-500 text-lg">A modern dashboard experience for verification codes.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="group p-3 rounded-lg border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-300 transition duration-300 w-full max-w-[420px] mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center group-hover:bg-gray-100 border border-gray-200 transition-colors">
                    {feature.icon}
                  </span>
                  <h3 className="text-sm font-normal text-black mb-0">{feature.title}</h3>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-2">{feature.desc}</p>
                <Link href="/pricing" className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700">
                  Learn more <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Live Pricing */}
        <section id="pricing" className="text-gray-900 py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Live pricing</h2>
                <p className="text-gray-500 text-lg max-w-xl">
                  Real-time country + service prices. Buy now to purchase inside your dashboard.
                </p>
              </div>
              <div className="flex gap-6 items-center">
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition font-medium">View full catalog</Link>
                <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">Buy now &rarr;</Link>                </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-8 py-5 font-semibold">Country</th>
                      <th className="px-8 py-5 font-semibold">Service</th>
                      <th className="px-8 py-5 font-semibold text-right">Price</th>
                      <th className="px-8 py-5 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pricingData.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-100 transition">
                        <td className="px-8 py-4 text-gray-700 font-medium">{item.country}</td>
                        <td className="px-8 py-4 font-medium text-gray-900">{item.service}</td>
                        <td className="px-8 py-4 text-right font-mono text-blue-600 font-bold">{item.price}</td>
                        <td className="px-8 py-4 text-right">
                          <button className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium transition">
                            Buy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 font-mono">
              Prices updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Add marquee animation to global styles if not present
// @layer utilities {
//   @keyframes marquee {
//     0% { transform: translateX(0); }
//     100% { transform: translateX(-50%); }
//   }
//   .animate-marquee {
//     animation: marquee 20s linear infinite;
//   }
// }
