"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import React from "react";
import { Home, CreditCard, Phone, Globe, Gift, HelpCircle, User, Clock, List, FileText, LogOut, Menu, X, Copy, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [view, setView] = useState("dashboard");
  const [userName, setUserName] = useState("User");
  const [userFullName, setUserFullName] = useState("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);

  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchUserHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        const parsed = JSON.parse(uStr);
        if (parsed?.id) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/user/${parsed.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.balance !== undefined) setUserBalance(data.balance);
            if (data.orders) setUserOrders(data.orders);
            if (data.transactions) setUserTransactions(data.transactions);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching history");
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const [virtualAccount, setVirtualAccount] = useState<{ number: string | null, bank: string | null }>({ number: null, bank: null });

  const [daisyCountries, setDaisyCountries] = useState<{id: number, name: string}[]>([]);
  const [usServices, setUsServices] = useState<{code: string, name: string}[]>([]);
  const [allServices, setAllServices] = useState<{code: string, name: string}[]>([]);

  const [exchangeRate, setExchangeRate] = useState<number>(1500);
  const [topUpPercentage, setTopUpPercentage] = useState<number>(10);

  useEffect(() => {
    const isClient = typeof window !== "undefined";
    if (isClient) {
      // Fetch global settings (Exchange rate & Margin)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/admin/settings`)
        .then(res => res.json())
        .then(data => {
            if (data.exchangeRate) setExchangeRate(data.exchangeRate);
            if (data.topUpPercentage) setTopUpPercentage(data.topUpPercentage);
        })
        .catch(err => console.error("Error fetching settings:", err));

      const u = localStorage.getItem("user");
      if (u) {
        try {
          const parsed = JSON.parse(u);
          if (parsed && parsed.displayName) {
            setUserName(parsed.displayName);
            setUserFullName(parsed.displayName);
          }
          if (parsed && parsed.id) {
            // Fetch real user balance and details
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/user/${parsed.id}`)
              .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user');
                return res.json();
              })
              .then(data => {
                if (data && data.balance !== undefined) setUserBalance(data.balance);
                if (data && data.virtual_account_number) {
                   setVirtualAccount({ number: data.virtual_account_number, bank: data.virtual_account_bank });
                }
                if (data.orders) setUserOrders(data.orders);
                if (data.transactions) setUserTransactions(data.transactions);
              })
              .catch(err => {
                console.error("Error fetching user. Is backend running? ", err);
              });
          }
        } catch(e) {}
      }

      // Fetch Daisy Countries
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/integrations/daisy/countries`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.countries) setDaisyCountries(data.data.countries);
        })
        .catch(err => console.error("Error fetching daisy countries:", err));

      // Fetch Daisy US Services (187 is USA)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/integrations/daisy/services/187`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.services) setUsServices(data.data.services);
        })
        .catch(err => console.error("Error fetching daisy us services:", err));
    }
  }, []);

  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const filteredUsServices = usServices.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  
  const [allCountrySearch, setAllCountrySearch] = useState("");
  const [allSelectedCountry, setAllSelectedCountry] = useState<{id: number, name: string} | null>(null);
  const [allSelectedService, setAllSelectedService] = useState<any>(null);
  const [allServiceSearch, setAllServiceSearch] = useState("");
  
  const filteredAllServices = allServices.filter(s =>
    s.name.toLowerCase().includes(allServiceSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(allServiceSearch.toLowerCase())
  );
  
  const filteredAllCountries = daisyCountries.filter(c => c.name.toLowerCase().includes(allCountrySearch.toLowerCase()));
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchPriceForService = (countryId: number, serviceCode: string, cb: (price: number) => void) => {
      setPriceLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/integrations/daisy/prices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryId, service: serviceCode })
      }).then(r => r.json())
        .then(d => {
            if (d.data?.tiers?.[0]) {
               const usd = parseFloat(d.data.tiers[0].price);
               const finalPriceNGN = Math.ceil(usd * exchangeRate * (1 + topUpPercentage / 100)); // Calculate final price using Admin settings
               cb(finalPriceNGN);
            } else { cb(-1); }
            setPriceLoading(false);
        }).catch(() => { cb(-1); setPriceLoading(false); });
  };
  
  const startPurchase = (country: string, serviceCode: string, price: number) => {
    const uStr = localStorage.getItem("user");
    if (!uStr) return alert("Session invalid, please login again.");
    let u;
    try { u = JSON.parse(uStr); } catch (e) { return alert("Session invalid"); }
    const pStr = String(price).replace(/,/g, ""); 
    const pNum = parseInt(pStr);
    
    if (userBalance < pNum) {
      alert("Insufficient balance! You need ₦" + (pNum - userBalance) + " more.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/integrations/daisy/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id, service: serviceCode, country, price: pNum })
    })
    .then(r => r.json())
    .then(data => {
      if (data.phone) {
        alert("Purchase successful! Number: " + data.phone);
        setUserBalance(prev => prev - pNum);
        setShowInsufficient(false);
      } else {
        alert("Purchase failed: " + (data.message || data.error || JSON.stringify(data)));
      }
    })
    .catch(err => alert("Error purchasing: " + err.message));
  };  const router = useRouter();

  function handleSignOut() {
    // Clear user session (customize as needed)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      document.cookie = "user-auth=; path=/; max-age=0";
    }
    router.push("/login");
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0 relative z-50">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-72 max-w-[85%] bg-white h-full shadow-2xl transition-transform transform translate-x-0 overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <span className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-sm font-medium">
            <button onClick={() => { setView("dashboard"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "dashboard" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><Home className="w-5 h-5"/> Dashboard</button>
            <button onClick={() => { setView("fundwallet"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "fundwallet" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><CreditCard className="w-5 h-5"/> Fund wallet</button>
            <button onClick={() => { setView("usanumbers"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "usanumbers" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><Phone className="w-5 h-5"/> USA numbers</button>
            <button onClick={() => { setView("allcountries"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "allcountries" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><Globe className="w-5 h-5"/> All countries</button>
            <button onClick={() => { setView("refer"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "refer" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><Gift className="w-5 h-5"/> Refer and earn</button>
            <button onClick={() => { setView("faq"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "faq" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><HelpCircle className="w-5 h-5"/> FAQ</button>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"><User className="w-5 h-5"/> Profile</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"><Clock className="w-5 h-5"/> History</a>
            <button onClick={() => { setView("numbershistory"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "numbershistory" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><List className="w-5 h-5"/> Numbers history</button>
            <button onClick={() => { setView("transactionsdashboard"); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${view === "transactionsdashboard" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}><FileText className="w-5 h-5"/> Transaction history</button>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-red-600 hover:bg-red-50 font-bold"><LogOut className="w-5 h-5"/> Sign out</button>
          </nav>
        </div>
        </div>
      )}

      <aside className="w-64 border-r border-gray-200 hidden md:flex flex-col shrink-0 bg-white">
        <div className="p-6 border-b border-gray-200 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <button onClick={() => setView("dashboard")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "dashboard" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <Home className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => setView("fundwallet")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "fundwallet" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <CreditCard className="w-4 h-4" /> Fund wallet
          </button>
          <button onClick={() => setView("usanumbers")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "usanumbers" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <Phone className="w-4 h-4" /> USA numbers
          </button>
          <button onClick={() => setView("allcountries")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "allcountries" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <Globe className="w-4 h-4" /> All countries
          </button>
          <button onClick={() => setView("refer")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "refer" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <Gift className="w-4 h-4" /> Refer and earn
          </button>
          <button onClick={() => setView("faq")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "faq" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <HelpCircle className="w-4 h-4" /> FAQ
          </button>
          <a href="#" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg w-full transition"><User className="w-4 h-4" /> Profile</a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg w-full transition"><Clock className="w-4 h-4" /> History</a>
          <button onClick={() => setView("numbershistory")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "numbershistory" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <List className="w-4 h-4" /> Numbers history
          </button>
          <button onClick={() => setView("transactionsdashboard")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${view === "transactionsdashboard" ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
            <FileText className="w-4 h-4" /> Transaction history
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-lg w-full transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto relative">
        
        {/* Account Details Modal */}
        {showAccountModal && virtualAccount?.number && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Account Details
                </h3>
                <button onClick={() => setShowAccountModal(false)} className="text-blue-100 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Bank Name</label>
                  <div className="text-gray-900 font-bold text-lg bg-gray-50 px-3 py-2 rounded">{virtualAccount.bank}</div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Account Number</label>
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-100">
                    <span className="text-2xl font-mono text-blue-700 tracking-wider font-bold">{virtualAccount.number}</span>
                    <button 
                      onClick={() => handleCopy(virtualAccount.number as string)}
                      className="p-2 bg-white rounded shadow-sm text-blue-600 hover:bg-blue-50 transition"
                      title="Copy account number"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Account Name</label>
                  <div className="text-gray-900 font-bold text-lg uppercase bg-gray-50 px-3 py-2 rounded">{userFullName}</div>
                </div>
                <div className="text-xs text-center text-gray-500">
                  Transfer funds to this account to instantly top up your wallet.
                </div>
                <button 
                  onClick={() => setShowAccountModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg mt-4 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "dashboard" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl">Welcome {userName}!</h1>
              <p className="text-gray-500 mt-1">Here's what's happening with your account today.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl shadow-md text-white bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <span className="text-xs text-blue-100 mb-1 font-medium uppercase tracking-wider">Wallet Balance</span>
                <span className="text-3xl font-bold mb-2">₦{userBalance.toLocaleString()}</span>
                <button className="bg-white text-blue-700 font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm hover:shadow transition mt-auto" onClick={() => setView("fundwallet")}>Recharge</button>
              </div>
              <div className="p-6 rounded-xl shadow-sm bg-blue-50 border border-blue-100 flex flex-col items-start">
                <span className="text-xs text-blue-700 mb-1 uppercase tracking-wider font-semibold">SMS Purchased - Lifetime</span>
                <span className="text-3xl font-bold mb-2 text-blue-900">{userOrders.length}</span>
              </div>
              <div className="p-6 rounded-xl shadow-md text-white bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-start relative overflow-hidden">
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
                <span className="text-xs text-blue-100 mb-1 font-medium uppercase tracking-wider">Total Recharge</span>
                <span className="text-3xl font-bold mb-2">₦{userBalance.toLocaleString()}</span>
              </div>
              <div className="p-6 rounded-xl shadow-sm bg-white border-l-4 border-blue-500 hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <span className="text-xs text-blue-800 mb-1 font-semibold uppercase tracking-wider block">Virtual Account Number</span>
                  {virtualAccount?.number ? (
                    <div className="mt-2">
                      <div className="text-sm font-bold text-gray-800 flex justify-between items-center bg-gray-50 px-3 py-2 rounded mb-2 border border-gray-100">
                        <span className="font-mono text-blue-700">{virtualAccount.number}</span>
                        <button 
                          onClick={() => handleCopy(virtualAccount.number as string)}
                          className="text-gray-400 hover:text-blue-600 transition p-1"
                          title="Copy"
                        >
                          {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <button 
                        className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition w-full mt-1"
                        onClick={() => setShowAccountModal(true)}
                      >
                        View Details
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="text-blue-600 font-bold underline text-sm mb-3 mt-1 block hover:text-blue-800 transition"
                        onClick={() => setView("fundwallet")}
                      >
                        Click to Generate
                      </button>
                      <button 
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition w-full shadow-blue-500/20"
                        onClick={() => setView("fundwallet")}
                      >
                        Fund Wallet
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mb-8">
              <button onClick={() => setView("numbershistory")} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold">Number history</button>
              <button onClick={() => setView("transactionsdashboard")} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold">Transaction history</button>
            </div>
          </>
        )}
        {view === "fundwallet" && (
          <div className="max-w-2xl mx-auto text-sm">
            <div className="p-5 rounded-xl shadow bg-white mb-6">
              <h1 className="text-lg mb-1 font-semibold">Fund Wallet</h1>
              <p className="text-gray-500 mb-4">Add funds to your wallet to purchase phone numbers</p>
              <span className="text-xs text-gray-500 mb-1 block">Current Balance</span>
              <span className="text-2xl font-bold mb-2 block">₦{userBalance.toLocaleString()}</span>
            </div>
            <div className="p-5 rounded-xl shadow bg-white mb-6">
              <h2 className="text-lg mb-1 font-bold text-blue-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Your Permanent Bank Account (Instant)
              </h2>
              <p className="text-gray-600 mb-5">Transfer any amount to this account. Your wallet will be funded automatically.</p>
              {virtualAccount?.number ? (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center shadow-inner max-w-sm mx-auto">
                   <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Bank Name</div>
                   <div className="text-xl font-bold text-gray-800 mb-4 bg-white py-2 rounded shadow-sm inline-block px-4">{virtualAccount.bank}</div>
                   
                   <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Account Number</div>
                   <div className="flex items-center justify-center gap-3 mb-4">
                     <div className="text-3xl font-mono text-blue-700 tracking-wider font-bold bg-white py-2 px-4 rounded shadow-sm">{virtualAccount.number}</div>
                     <button 
                       onClick={() => handleCopy(virtualAccount.number as string)}
                       className="p-2 bg-white rounded shadow-sm text-blue-600 hover:bg-blue-50 transition"
                       title="Copy account number"
                     >
                       {copied ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                     </button>
                   </div>
                   
                   <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Account Name</div>
                   <div className="text-lg font-bold text-gray-800 mb-6 uppercase">{userFullName}</div>

                   <button 
                     onClick={async () => {
                       await fetchUserHistory();
                       setView('dashboard');
                     }}
                     disabled={isLoadingHistory}
                     className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white py-3 rounded-lg font-bold text-sm shadow-md transition"
                   >
                     {isLoadingHistory ? 'Checking your payment...' : 'I Have Made This Payment'}
                   </button>
                   <div className="text-xs font-medium text-blue-600/80 mt-3">
                     Your payment will reflect in your wallet within 5 minutes
                   </div>
                </div>
              ) : (
                <button 
                  onClick={async () => {
                      const uStr = localStorage.getItem('user');
                      if (!uStr) return alert('Session invalid, please login again.');
                      const u = JSON.parse(uStr);
                      if (!u?.id) return alert('Session invalid');
                      
                      try {
                          // Generate Virtual Account directly (PocketFi handles customer implicitly)
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/integrations/pocketfi/virtual-account`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: u.id })
                          });
                          const data = await res.json();
                          if (data.account_number) {
                             setVirtualAccount({ number: data.account_number, bank: data.bank_name });
                             alert("Account generated successfully!");
                          } else {
                             alert("Failed to generate account: " + JSON.stringify(data));
                          }
                      } catch(err: any) { alert("Error: " + err.message); }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition"
                >
                  Generate My Account Number
                </button>
              )}
            </div>
            <div className="p-5 rounded-xl shadow bg-white mb-6">
              <h2 className="text-base mb-2 font-semibold">Important Information</h2>
              <ul className="list-disc list-inside text-gray-700 mb-2 text-xs">
                <li>No transfer fees</li>
                <li>Instant account activation</li>
                <li>Funds never expire</li>
                <li>Available 24/7</li>
                <li>Minimum deposit: ₦100</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl shadow bg-white mb-6">
              <h2 className="text-base mb-2 font-semibold">Need Help?</h2>
              <p className="text-gray-500 mb-2 text-xs">If your payment doesn't reflect within 10 minutes, please contact our support team.</p>
              <button className="bg-gray-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs">Contact Support</button>
            </div>
          </div>
        )}
        {view === "usanumbers" && (
          <div className="max-w-3xl mx-auto text-sm">
            <div className="p-8 rounded-2xl shadow bg-white mb-8 min-h-[380px]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-semibold">United States</span>
                <span className="text-3xl">🇺🇸</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-gray-500">Balance:</span>
                <span className="text-lg font-bold">₦{userBalance.toLocaleString()}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs">Refresh</button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600">Select a service to purchase a US phone number</p>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Select Service</label>
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-2"
                  value={serviceSearch}
                  onChange={e => {
                    setServiceSearch(e.target.value);
                    if (selectedService) setSelectedService(null);
                  }}
                  disabled={!!selectedService}
                />
                {selectedService ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-4 py-3 mb-2 bg-blue-50 border border-blue-200 rounded-lg text-sm shadow-sm">
                      <span>{selectedService.name} <span className="text-gray-400">({selectedService.code})</span></span>
                      <div className="flex items-center gap-4">
                        {priceLoading ? <span className="text-gray-500 italic text-xs">Fetching...</span> : 
                         servicePrice && servicePrice > 0 ? <span className="font-bold text-gray-800">₦{servicePrice}</span> :
                         <span className="text-red-500 font-bold text-xs">Unavailable</span>}
                        <button className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 bg-red-50 rounded" onClick={() => { setSelectedService(null); setServiceSearch(""); setServicePrice(null); setShowInsufficient(false); }}>Cancel</button> 
                      </div>
                    </div>
                    {servicePrice && servicePrice > 0 && (
                      <button 
                        onClick={() => {
                            if (userBalance < servicePrice) setShowInsufficient(true);
                            else startPurchase('United States', selectedService.code, servicePrice);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-md w-full transition"
                      >
                        Purchase Number
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg bg-white shadow-sm">
                    {filteredUsServices.length === 0 ? (
                      <div className="p-2 text-xs text-gray-400">No services found. Ensure backend is running.</div>
                    ) : (
                      filteredUsServices.map((service, idx) => (
                        <div key={service.code} className={`flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs`}
                          onClick={() => {
                              setSelectedService(service);
                              fetchPriceForService(187, service.code, (price) => {
                                  setServicePrice(price);
                              });
                          }}>
                          <span>{service.name} <span className="text-gray-400">({service.code})</span></span>
                          <span className="font-semibold text-blue-600">Check Price</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {showInsufficient && selectedService && servicePrice && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs text-center">
                    <div className="mb-2 text-xs text-gray-500">Your balance</div>
                    <div className="text-2xl font-bold mb-2">₦{userBalance.toLocaleString()}</div>
                    <div className="mb-2 text-xs text-gray-500">Price</div>
                    <div className="text-xl font-bold mb-2">₦{servicePrice}</div>
                    <div className="text-red-600 text-xs mb-2">Insufficient balance. You need ₦{servicePrice - userBalance} more.</div>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold w-full mb-2 transition" 
                      onClick={() => { setShowInsufficient(false); setView("fundwallet"); }}
                    >
                      Fund Wallet
                    </button>
                    <div className="text-gray-500 text-xs">Tip: top up your account to proceed.</div>
                    <button className="mt-4 text-xs text-gray-500 underline" onClick={() => setShowInsufficient(false)}>Close</button>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">{filteredUsServices.length} services available</div>
            </div>
          </div>
        )}
        {view === "allcountries" && (
          <div className="max-w-5xl mx-auto text-sm">
            <div className="p-6 rounded-2xl shadow bg-white mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold mb-1">All Countries</h1>
                <p className="text-gray-500">Select a country and service to get your temporary phone number</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs">Refresh</button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Country selection banner */}
              <div className="flex-1 p-6 rounded-2xl shadow bg-white mb-8 flex flex-col gap-4 min-w-[260px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-bold">1</span>
                  <span className="font-semibold">Select Country</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select a country..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs"
                    value={allCountrySearch}
                    onChange={e => { setAllCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                    onFocus={() => setShowCountryDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                  />
                  {showCountryDropdown && (
                    <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border border-gray-100 rounded-lg bg-white shadow z-10">
                      {filteredAllCountries.length === 0 ? (
                        <div className="p-2 text-xs text-gray-400">No countries found</div>
                      ) : (
                        filteredAllCountries.map((country) => (
                          <div key={country.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs"
                            onMouseDown={() => { 
                                setAllSelectedCountry(country); 
                                setAllCountrySearch(""); 
                                setShowCountryDropdown(false);
                                setAllServices([]);
                                setAllSelectedService(null);
                                setServicePrice(null);
                                fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://ultraverify-server.onrender.com"}/api/integrations/daisy/services/${country.id}`)
                                  .then(res => res.json())
                                  .then(data => { if (data.data?.services) setAllServices(data.data.services); });
                            }}>
                            {country.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">Selected Country</div>
                <div className="text-base font-semibold">{allSelectedCountry ? allSelectedCountry.name : "None"}</div>
              </div>
              {/* Service selection banner */}
              <div className="flex-1 p-6 rounded-2xl shadow bg-white mb-8 flex flex-col gap-4 min-w-[260px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-bold">2</span>
                  <span className="font-semibold">Select Service</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">Selected Country</div>
                <div className="text-base font-semibold mb-2">{allSelectedCountry ? allSelectedCountry.name : "None"}</div>
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-2"
                  value={allServiceSearch}
                  onChange={e => setAllServiceSearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg bg-white shadow-sm mb-2">
                  {!allSelectedCountry ? (
                     <div className="p-2 text-xs text-gray-400">Please select a country first.</div>
                  ) : filteredAllServices.length === 0 ? (
                    <div className="p-2 text-xs text-gray-400">No services found for this country.</div>
                  ) : (
                    filteredAllServices.map((service) => (
                        <div key={service.code} className={`flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs ${allSelectedService && allSelectedService.code === service.code ? "bg-blue-50 border-l-2 border-blue-500" : ""}`} 
                          onClick={() => {
                              setAllSelectedService(service);
                              fetchPriceForService(allSelectedCountry.id, service.code, (price) => {
                                  setServicePrice(price);
                              });
                          }}
                        >
                          <span>{service.name} <span className="text-gray-400">({service.code})</span></span>
                          <span className="font-semibold text-blue-600">Select</span> 
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{filteredAllServices.length} services available</div>
                  
                  {allSelectedService && priceLoading && <div className="text-xs text-gray-500 text-center font-bold">Fetching real-time price...</div>}
                  {allSelectedService && !priceLoading && servicePrice === -1 && <div className="text-xs text-red-500 text-center font-bold">Number unavailable for this service.</div>}
                  
                  <button 
                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-xs w-full font-bold shadow transition ${!allSelectedService || priceLoading || !servicePrice || servicePrice < 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                    disabled={!allSelectedService || priceLoading || !servicePrice || servicePrice <= 0}
                    onClick={() => {
                      if (allSelectedService && allSelectedCountry && servicePrice && servicePrice > 0) {
                        startPurchase(allSelectedCountry.name, allSelectedService.code, servicePrice);
                      }
                    }}
                  >
                    Buy Number {servicePrice && servicePrice > 0 ? `for ₦${servicePrice}` : ""}
                  </button>
                </div>
              </div>
          </div>
        )}
        {view === "refer" && (
          <div className="max-w-5xl mx-auto text-sm">
            <div className="p-6 rounded-2xl shadow bg-white mb-8">
              <h1 className="text-lg font-semibold mb-1">Refer & Earn</h1>
              <p className="text-gray-500">Invite friends and earn ₦3 for each successful referral</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1 p-5 rounded-xl shadow bg-white flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 mb-1">Total Referrals</div>
                <div className="text-2xl font-bold">12</div>
              </div>
              <div className="flex-1 p-5 rounded-xl shadow bg-white flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 mb-1">Earnings</div>
                <div className="text-2xl font-bold">₦36.00</div>
              </div>
              <div className="flex-1 p-5 rounded-xl shadow bg-white flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 mb-1">Pending</div>
                <div className="text-2xl font-bold">3</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1 p-5 rounded-xl shadow bg-white mb-6 flex flex-col gap-2">
                <div className="text-xs text-gray-500 mb-1">Your Referral Link</div>
                <div className="text-xs bg-gray-100 rounded px-2 py-1 mb-2 break-all">https://smslegit.com/ref/SMSL-XJ9K2P</div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs">Copy</button>
                  <button className="bg-gray-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs">Share</button>
                  <button className="bg-gray-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs">Email</button>
                </div>
              </div>
              <div className="flex-1 p-5 rounded-xl shadow bg-white mb-6 flex flex-col gap-2">
                <div className="text-base font-semibold mb-2">How It Works</div>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-base font-bold">1</span>
                  <span className="text-xs">Share your unique referral link with friends</span>
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-base font-bold">2</span>
                  <span className="text-xs">They sign up and add ₦10+ to their wallet</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-base font-bold">3</span>
                  <span className="text-xs">You both get ₦3 in credits!</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1 p-5 rounded-xl shadow bg-white mb-6 flex flex-col gap-2">
                <div className="text-base font-semibold mb-2">Recent Referrals</div>
                <div className="flex justify-between items-center border-b border-gray-100 py-2">
                  <div>
                    <div className="font-semibold text-xs">John D.</div>
                    <div className="text-xs text-gray-400">2 days ago</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-semibold">Active</div>
                    <div className="text-xs font-bold">₦3.00</div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 py-2">
                  <div>
                    <div className="font-semibold text-xs">Sarah M.</div>
                    <div className="text-xs text-gray-400">5 days ago</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-semibold">Active</div>
                    <div className="text-xs font-bold">₦3.00</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-semibold text-xs">Mike R.</div>
                    <div className="text-xs text-gray-400">1 week ago</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-yellow-600 font-semibold">Pending</div>
                    <div className="text-xs font-bold">₦{userBalance.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-5 rounded-xl shadow bg-white mb-6 flex flex-col gap-2">
                <div className="text-base font-semibold mb-2">Terms</div>
                <ul className="list-disc list-inside text-xs text-gray-700 mb-2">
                  <li>Unlimited referrals</li>
                  <li>Credits added instantly</li>
                  <li>No expiration on earnings</li>
                  <li>Minimum ₦10 first deposit required</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {view === "faq" && (
          <div className="max-w-3xl mx-auto text-sm">
            <div className="p-6 rounded-2xl shadow bg-white mb-8">
              <h1 className="text-lg font-semibold mb-1">Frequently Asked Questions</h1>
              <p className="text-gray-500">Find answers to common questions about SMS</p>
            </div>
            <div className="mb-6">
              <h2 className="font-semibold text-base mb-2">Getting Started</h2>
              <FAQItem question="How does SMS work?" answer="SMS provides temporary virtual numbers for receiving SMS online. Choose a country and service, get a number, and receive your code instantly." />
              <FAQItem question="Do I need a subscription?" answer="No subscription is required. You pay only for the numbers you use." />
              <FAQItem question="How much does it cost?" answer="Pricing varies by country and service. All prices are shown before you purchase a number." />
            </div>
            <div className="mb-6">
              <h2 className="font-semibold text-base mb-2">Using Numbers</h2>
              <FAQItem question="How long can I use a number?" answer="Numbers are valid for a limited time, typically 10-20 minutes, or until you receive your SMS." />
              <FAQItem question="Can I receive multiple SMS on one number?" answer="Some numbers allow multiple SMS, but most are for single use only. Check the service details before purchase." />
              <FAQItem question="Which services are supported?" answer="We support a wide range of services. The list is updated regularly and shown in the dashboard." />
              <FAQItem question="What if I don't receive the code?" answer="If you don't receive your code, please try another number or contact support for assistance." />
            </div>
            <div className="mb-6">
              <h2 className="font-semibold text-base mb-2">Wallet & Payments</h2>
              <FAQItem question="What payment methods do you accept?" answer="We accept cards, bank transfers, and other local payment methods." />
              <FAQItem question="Do my credits expire?" answer="No, your credits do not expire and remain in your wallet until used." />
              <FAQItem question="Can I get a refund?" answer="Refunds are available in certain cases. Please contact support for details." />
              <FAQItem question="Is there a minimum deposit?" answer="Yes, the minimum deposit is ₦10." />
            </div>
            <div className="mb-6">
              <h2 className="font-semibold text-base mb-2">Privacy & Security</h2>
              <FAQItem question="Is my data secure?" answer="Yes, we use industry-standard security to protect your data." />
              <FAQItem question="Do you sell my information?" answer="No, we do not sell or share your personal information." />
              <FAQItem question="Are the numbers private?" answer="Yes, each number is unique to your session and not shared while in use." />
            </div>
            <div className="p-6 rounded-2xl shadow bg-white mb-8 flex flex-col items-center">
              <h2 className="font-semibold text-base mb-2">Still have questions?</h2>
              <p className="text-gray-500 mb-2">Our support team is here to help you 24/7</p>
              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs">Email Support</button>
                <button className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg text-xs">Live Chat</button>
              </div>
            </div>
          </div>
        )}
        {view === "history" && (
          <div className="max-w-3xl mx-auto text-sm">
            <div className="p-6 rounded-2xl shadow bg-white mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold mb-1">Number Purchase History</h1>
                <p className="text-gray-500">View all your past number purchases and verification codes</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs">Refresh</button>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by service, number, or country..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs"
              />
              <button className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg text-xs border border-gray-200">Filter</button>
            </div>
            <div className="p-6 rounded-2xl shadow bg-white flex flex-col items-center">
              <h2 className="font-semibold text-base mb-2">Purchase History</h2>
              <p className="text-gray-500 mb-2">No number history yet</p>
              <p className="text-xs text-gray-400">Your number purchases will appear here</p>
            </div>
          </div>
        )}
        {view === "numbershistory" && (
          <div className="max-w-3xl mx-auto text-sm">
            <div className="p-6 rounded-2xl shadow bg-white mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold mb-1">Number Purchase History</h1>
                <p className="text-gray-500">View all your past number purchases and verification codes</p>
              </div>
              <button onClick={() => fetchUserHistory()} disabled={isLoadingHistory} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 transition">{isLoadingHistory ? 'Refreshing...' : 'Refresh'}</button>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by service, number, or country..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs"
              />
              <button className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg text-xs border border-gray-200">Filter</button>
            </div>
            <div className="p-6 rounded-2xl shadow bg-white flex flex-col items-center">
              <div className="w-full flex justify-between font-semibold text-xs text-gray-500 border-b pb-2 mb-4">
                <span className="w-1/4">Service</span>
                <span className="w-1/4">Number</span>
                <span className="w-1/4">Price</span>
                <span className="w-1/4 text-right">When</span>
              </div>
              
              {userOrders.length === 0 ? (
                <div className="w-full text-center text-gray-400 text-xs py-8">
                  No orders yet. Buy a number.
                </div>
              ) : (
                <div className="w-full space-y-3">
                  {userOrders.map((order, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-gray-50">
                      <span className="w-1/4 font-semibold text-gray-800">{order.service} - {order.country}</span>
                      <span className="w-1/4 font-mono text-blue-600">{order.phone || order.number}</span>
                      <span className="w-1/4 font-semibold">₦{order.price}</span>
                      <span className="w-1/4 text-right text-gray-400">{new Date(order.date || Date.now()).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {view === "transactionsdashboard" && (
          <div className="max-w-3xl mx-auto text-sm">
            <div className="p-6 rounded-2xl shadow bg-white mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold mb-1">Transaction History</h1>
                <p className="text-gray-500">View all your wallet transactions</p>
              </div>
              <button onClick={() => fetchUserHistory()} disabled={isLoadingHistory} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 transition">{isLoadingHistory ? 'Refreshing...' : 'Refresh'}</button>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search transactions..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs"
              />
              <button className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg text-xs border border-gray-200">Filter</button>
            </div>
            <div className="p-6 rounded-2xl shadow bg-white flex flex-col items-center">
              
              {userTransactions.length === 0 ? (
                <>
                  <h2 className="font-semibold text-base mb-2">Transaction History</h2>
                  <p className="text-gray-500 mb-2">No transactions yet.</p>
                  <p className="text-xs text-gray-400">Your wallet transactions will appear here</p>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div className="w-full flex justify-between font-semibold text-xs text-gray-500 border-b pb-2 mb-2">
                    <span>Description</span>
                    <span>Amount</span>
                    <span className="text-right">Date</span>
                  </div>
                  {[...userTransactions].reverse().map((tx, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-3 border-b border-gray-50">
                      <span className="font-semibold text-gray-800">{tx.method || tx.description || tx.bankOrDepositName || 'Deposit'}</span>
                      <span className={`font-bold ${tx.type === 'Funding' || tx.type === 'deposit' || tx.action === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'Funding' || tx.type === 'deposit' || tx.action === 'credit' ? '+' : '-'}₦{tx.amount || tx.creditAmount || tx.debitAmount || 0}
                      </span>
                      <span className="text-right text-gray-400">{new Date(tx.date || tx.time || Date.now()).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Telegram Icon */}
      <a 
        href="https://t.me/ultraverifyy" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-[#0088cc] text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-[#0077b5] hover:scale-110 hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Contact us on Telegram"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>
    </div>
  );
}

// FAQItem component for collapsible FAQ entries
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mb-2">
      <button
        className="w-full flex justify-between items-center py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium text-sm">{question}</span>
        <span className="ml-2">{open ? "-" : "+"}</span>
      </button>
      {open && (
        <div className="px-3 py-2 text-xs text-gray-600 bg-white border-l-2 border-blue-500 rounded-b">
          {answer}
        </div>
      )}
    </div>
  );
}
