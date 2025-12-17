import React from 'react';
import ProfitCalculator from '../ProfitCalculator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      
      {/* Background Noise */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Tools
        </Link>

        {/* Page Header - Fixed Clipping */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 pb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 leading-tight">
                Dropshipping Profit Calculator
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Stop guessing. Account for <span className="text-red-400">RTOs, Ads, and Shipping</span> to see if your product is actually a winner.
            </p>
        </div>

        {/* THE TOOL */}
        <ProfitCalculator />

        {/* Video Tutorial Section */}
        <div className="mt-24 border-t border-white/10 pt-16">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-6">How to use this accurately?</h2>
                <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#111] relative group">
                    <iframe 
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=Placeholder" 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                    ></iframe>
                </div>
                <p className="text-gray-500 mt-6 text-sm">
                    Watch the full breakdown on <span className="text-white font-medium">ReadyFlow YouTube Channel</span>.
                </p>
            </div>
        </div>

      </div>
    </main>
  );
}