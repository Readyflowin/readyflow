"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Github, Twitter, Youtube, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* BRAND COLUMN */}
            <div className="space-y-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative h-10 w-auto flex items-center">
                        <Image 
                            src="/logo.png"
                            alt="ReadyFlow Logo"
                            width={300} 
                            height={80} 
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white group-hover:text-gray-200 transition-colors">
                        ReadyFlow
                    </span>
                </Link>
                {/* 👇 UPDATED: More "Operator Focused" description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                    Built for the 1% of Indian Dropshippers who prioritize <b>Net Profit</b> over Revenue screenshots.
                </p>
                <div className="flex gap-4 pt-2">
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={18} /></Link>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Github size={18} /></Link>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube size={18} /></Link>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Mail size={18} /></Link>
                </div>
            </div>

            {/* LINKS COLUMN 1 */}
            <div>
                <h4 className="font-bold mb-6">Tools</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><Link href="#" className="hover:text-orange-500 transition-colors">Policy Generator</Link></li>
                    <li><Link href="#" className="hover:text-orange-500 transition-colors">Section Builder</Link></li>
                    <li><Link href="#" className="hover:text-orange-500 transition-colors">RTO Protector</Link></li>
                    <li><Link href="/tools/profit-calculator" className="hover:text-orange-500 transition-colors">Profit Calculator</Link></li>
                </ul>
            </div>

            {/* LINKS COLUMN 2 */}
            <div>
                <h4 className="font-bold mb-6">Resources</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">YouTube Channel</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                </ul>
            </div>

            {/* LINKS COLUMN 3 */}
            <div>
                <h4 className="font-bold mb-6">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Refund Policy</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2025 ReadyFlow. Built by Aditya.</p>
            <p className="flex items-center gap-1">Made with <span className="text-orange-500">🧡</span> in India.</p>
        </div>

      </div>
    </footer>
  );
}

export default SiteFooter;