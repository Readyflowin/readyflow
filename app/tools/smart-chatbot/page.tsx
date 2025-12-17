"use client";

import React from 'react';
// 👇 FIXED: This points to the parent folder where SmartChatbot.tsx lives
import SmartChatbot from '../SmartChatbot'; 
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SmartBotPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      
      {/* Background Noise */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Tools
        </Link>

        {/* Header - UPDATED FOR BUSINESS PSYCHOLOGY */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 leading-tight">
                WhatsApp Chatbot — Auto-Reply  <br/> & Lead Capture
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Indian customers need instant answers. Use this to get their contact for further promotions. One tool solves both causes: <br/>
                <span className="text-orange-500">Automate FAQs, reduce support calls, and look professional 24/7.</span>
            </p>
        </div>

        {/* THE TOOL */}
        <SmartChatbot />

      </div>
    </main>
  );
}