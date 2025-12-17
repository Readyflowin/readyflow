import React from 'react';
// FIX: The component is in 'app/tools/', so we go up one level (../)
import PolicyGenerator from '../PolicyGenerator'; 
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PolicyPage() {
  return (
    // ADDED: 'overflow-x-hidden' to stop horizontal scrolling
    <main className="min-h-screen bg-black text-white pt-24 pb-20 overflow-x-hidden">
      
      {/* Background Noise */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Tools
        </Link>

        {/* Header - TRUST BUILDING */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 leading-tight">
                Secure Your Store in 2 Minutes.
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Generate <span className="text-green-500 font-bold">Razorpay-Approved</span> legal policies for free.
                <br/>Avoid gateway rejections and build customer trust instantly.
            </p>
        </div>

        {/* THE TOOL */}
        <PolicyGenerator />

      </div>
    </main>
  );
}