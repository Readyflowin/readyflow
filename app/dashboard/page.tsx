"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  Zap, 
  Clock, 
  ChevronRight,
  Shield,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";

// Firebase Imports
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { trackToolUsage } from "@/lib/db"; 

// Payment Import
import { initializePayment } from "@/lib/payment";

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real Data State
  const [user, setUser] = useState<any>(null); // Auth User
  const [userData, setUserData] = useState<any>(null); // Database Data
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth & Database Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Listen to Firestore Real-time
        const userRef = doc(db, "users", currentUser.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        });
        setLoading(false);
        return () => unsubDoc();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Handle Tool Click (Tracks usage then navigates)
  const handleToolClick = async (toolKey: string, path: string) => {
    if (!user) return;
    // Update DB count
    await trackToolUsage(user.uid, toolKey);
    // Go to page
    router.push(path);
  };

  const handleSignOut = async () => {
      await signOut(auth);
      router.push("/login");
  };

  // Helper to format date
  const getMemberSince = () => {
      if (!userData?.memberSince) return "Just now";
      return new Date(userData.memberSince.seconds * 1000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full mb-4 shadow-lg shadow-orange-500/20 overflow-hidden border-2 border-orange-500/50">
                <img 
                    src={userData?.photoURL || "https://via.placeholder.com/80"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-white">{userData?.name || "User"}</h2>
              <p className="text-gray-500 text-xs mb-4">{userData?.email}</p>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                <span className={`w-2 h-2 rounded-full ${userData?.plan === 'Premium' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                {userData?.plan || "Free Starter"}
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'billing', label: 'Subscription', icon: CreditCard },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 ${
                    activeTab === item.id 
                      ? 'bg-white/5 border-orange-500 text-white' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-l-2 border-transparent"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>

          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. PLAN STATUS CARD */}
            <div className="bg-gradient-to-r from-[#0f0f0f] to-[#0a0a0a] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    Current Plan: <span className="text-gray-400 font-normal">{userData?.plan || "Free"}</span>
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    You are currently on the {userData?.plan || "Free"} tier. Upgrade to unlock Premium Popups and unlimited tools.
                  </p>
                </div>
                
                {/* UPGRADE BUTTON WITH RAZORPAY INTEGRATION */}
                {userData?.plan !== "Premium" ? (
                    <button 
                        onClick={() => initializePayment(() => router.refresh())}
                        className="group px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                    >
                        <Crown size={18} className="text-orange-600" />
                        Upgrade to Pro (₹29)
                    </button>
                ) : (
                    <button className="group px-6 py-3 bg-green-500/10 text-green-500 font-bold rounded-xl flex items-center gap-2 cursor-default border border-green-500/20">
                        <Shield size={18} />
                        Plan Active
                    </button>
                )}
              </div>
            </div>

            {/* 2. STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Zap size={18} />
                  <span className="text-xs uppercase tracking-wider font-bold">Tools Used</span>
                </div>
                <p className="text-3xl font-black text-white">{userData?.toolsUsedCount || 0}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Clock size={18} />
                  <span className="text-xs uppercase tracking-wider font-bold">Member Since</span>
                </div>
                <p className="text-xl font-bold text-white">{getMemberSince()}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Shield size={18} />
                  <span className="text-xs uppercase tracking-wider font-bold">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <p className="text-xl font-bold text-white">{userData?.status || "Active"}</p>
                </div>
              </div>
            </div>

            {/* 3. RECENT ACTIVITY / TOOLS */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Quick Access</h3>
              
              <div className="space-y-3">
                
                {/* POPUP BUILDER */}
                <div 
                    onClick={() => handleToolClick('popupBuilder', '/tools/popup-builder')}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">1</div>
                      <div>
                        <h4 className="font-bold text-white">Pop-up Builder</h4>
                        <p className="text-xs text-gray-500">Used: {userData?.toolsUsage?.popupBuilder || 0} times</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2 py-1 rounded border bg-orange-500/10 text-orange-500 border-orange-500/20">Premium</span>
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* POLICY GENERATOR */}
                <div 
                    onClick={() => handleToolClick('policyGenerator', '/tools/policy-generator')}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">2</div>
                      <div>
                        <h4 className="font-bold text-white">Policy Generator</h4>
                        <p className="text-xs text-gray-500">Used: {userData?.toolsUsage?.policyGenerator || 0} times</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2 py-1 rounded border bg-green-500/10 text-green-500 border-green-500/20">Free</span>
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                </div>

                 {/* PROFIT CALCULATOR */}
                 <div 
                    onClick={() => handleToolClick('roiCalculator', '/tools/profit-calculator')}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">3</div>
                      <div>
                        <h4 className="font-bold text-white">ROI Calculator</h4>
                        <p className="text-xs text-gray-500">Used: {userData?.toolsUsage?.roiCalculator || 0} times</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2 py-1 rounded border bg-green-500/10 text-green-500 border-green-500/20">Free</span>
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* WHATSAPP CHATBOT (NEW) */}
                 <div 
                    onClick={() => handleToolClick('smartChatbot', '/tools/smart-chatbot')}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">4</div>
                      <div>
                        <h4 className="font-bold text-white">WhatsApp Bot</h4>
                        <p className="text-xs text-gray-500">Used: {userData?.toolsUsage?.smartChatbot || 0} times</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2 py-1 rounded border bg-orange-500/10 text-orange-500 border-orange-500/20">Premium</span>
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}