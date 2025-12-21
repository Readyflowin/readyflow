import React from 'react';
import { Metadata } from 'next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import RTOShieldBuilder from '../RTOShieldBuilder';

export const revalidate = 3600; // ISR for speed

export const metadata: Metadata = {
  title: 'RTO Shield: Stop Fake Shopify Orders | ReadyFlow',
  description: 'The most advanced RTO reduction tool for Indian stores. Block high-risk pincodes and fake order patterns instantly.',
  keywords: ['Shopify RTO India', 'Pincode gate', 'Stop returns Shopify', 'ReadyFlow'],
};

export default function RTOShieldPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-white pt-16 md:pt-24 pb-48 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/[0.04] rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[140px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-[10px] md:text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Toolkit
        </Link>

        <div className="mb-16 md:mb-24 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <ShieldAlert size={14} /> Security Infrastructure
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight md:leading-[0.85] tracking-tighter uppercase">
                RTO <br /> <span className="text-indigo-500">Shield.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-2xl max-w-2xl leading-tight font-medium">
                India mein dhanda sales se nahi, <span className="text-white font-bold tracking-tight">Net Profit</span> se chalta hai. Stop fake orders before they hit your wallet.
            </p>
        </div>

        <RTOShieldBuilder />
      </div>
    </main>
  );
}