"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Code2, Check, Monitor, Smartphone, 
  Lock, Loader2, X, Clock, Calendar as CalendarIcon, ArrowRight, Zap
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore"; 

const RTO_LIST = ["801108","800027","800020","110094","110095","110096","122107","249202"];

export default function RTOShieldBuilder() {
  const router = useRouter(); // ✅ ERROR FIX: router initialized
  const [isMounted, setIsMounted] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [showStickyBanner, setShowStickyBanner] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [meetingStep, setMeetingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [isPro, setIsPro] = useState(false); 
  const [hasPremiumPlan, setHasPremiumPlan] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [copied, setCopied] = useState(false);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Settings State - Now includes Sub-headline
  const [settings, setSettings] = useState({
    headline: "Verify delivery",
    subheadline: "SECURE CHECKOUT ENABLED", 
    color: "#6366f1", 
    badgeText: "RF", 
    buttonText: "CONTINUE TO BUY",
    delay: 2, 
  });

  useEffect(() => {
    setIsMounted(true);
    const checkPlan = async () => {
        const user = auth.currentUser;
        if (!user) { setLoadingPlan(false); return; }
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && (userSnap.data().plan === "Premium" || userSnap.data().plan === "Pro")) {
                setHasPremiumPlan(true);
            }
        } catch (err) { console.error(err); }
        setLoadingPlan(false);
    };
    checkPlan();

    const handleScroll = () => {
      if (window.scrollY > 500 && !isBannerDismissed) setShowStickyBanner(true);
      else setShowStickyBanner(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBannerDismissed]);

  const handleScheduleSubmit = () => {
    if (!selectedDate || !selectedTime) return;
    const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const msg = `Hi ReadyFlow! I want to book the RTO Audit (₹1999). Tool use karne ke baad I need a diagnosis.\n\n*Date:* ${dateStr}\n*Slot:* ${selectedTime}`;
    window.open(`https://wa.me/918602555840?text=${encodeURIComponent(msg)}`, '_blank');
    setIsSchedulerOpen(false);
  };

  const generateSnippet = () => {
    const watermark = isPro ? "" : `<a href="https://readyflow.in" target="_blank" style="display:block; margin-top:20px; font-size:10px; color:#cbd5e1; text-decoration:none; text-align:center; font-family:sans-serif; font-weight:700; opacity:0.6;">⚡ PROTECTED BY READYFLOW</a>`;
    
    return `<style>
  #rf-shield-wrapper { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2147483647; font-family: 'Inter', sans-serif; backdrop-filter: blur(10px); visibility: hidden; opacity: 0; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
  #rf-shield-wrapper.active { visibility: visible; opacity: 1; }
  .rf-card { width: 420px; max-width: 92%; background: #ffffff; border-radius: 28px; padding: 45px 35px; box-shadow: 0 40px 100px -10px rgba(0,0,0,0.6); color: #111; text-align: center; }
  .rf-badge { width: 65px; height: 65px; background: ${settings.color}; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; margin: 0 auto 30px; font-size: 26px; box-shadow: 0 20px 40px -8px ${settings.color}66; }
  .rf-title { font-size: 26px; font-weight: 900; margin: 0 0 12px; letter-spacing: -0.04em; color: #111; }
  .rf-sub { font-size: 11px; color: #888; margin-bottom: 35px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; }
  .rf-input { width: 100%; padding: 20px; border: 2px solid #f0f0f0; border-radius: 18px; margin-bottom: 20px; text-align: center; font-size: 22px; font-weight: 900; color: #111; letter-spacing: 0.3em; box-sizing: border-box; }
  .rf-btn { width: 100%; background: ${settings.color}; color: #fff; border: none; padding: 20px; border-radius: 18px; font-weight: 900; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.12em; font-size: 14px; }
  .rf-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .rf-error { color: #e11d48; font-size: 13px; margin-top: 18px; font-weight: 800; display: none; text-transform: uppercase; }
</style>
<div id="rf-shield-wrapper">
  <div class="rf-card">
    <div class="rf-badge">${settings.badgeText}</div>
    <h3 class="rf-title">${settings.headline}</h3>
    <p class="rf-sub">${settings.subheadline}</p>
    <input id="rf-pin-field" class="rf-input" type="text" inputmode="numeric" maxlength="6" placeholder="000000">
    <button id="rf-verify-btn" class="rf-btn" disabled>${settings.buttonText}</button>
    <div id="rf-error-msg" class="rf-error"></div>
    ${watermark}
  </div>
</div>
<script>
(function(){
  if(localStorage.getItem('rf_shield_verified')) return;
  const RTO_DB = new Set(${JSON.stringify(RTO_LIST)});
  const FAKE_PATTERNS = [/^(\\d)\\1{5}$/, /^123456$/, /^012345$/, /^654321$/, /^111111$/];
  setTimeout(() => {
    const wrap = document.getElementById('rf-shield-wrapper');
    const inp = document.getElementById('rf-pin-field');
    const btn = document.getElementById('rf-verify-btn');
    const err = document.getElementById('rf-error-msg');
    wrap.classList.add('active');
    inp.addEventListener('input', () => { btn.disabled = inp.value.length !== 6; err.style.display = 'none'; });
    btn.addEventListener('click', () => {
      const val = inp.value;
      if(RTO_DB.has(val) || FAKE_PATTERNS.some(p => p.test(val))) {
        err.innerText = '⚠️ DELIVERY BLOCKED FOR THIS PINCODE'; err.style.display = 'block';
      } else {
        btn.innerText = 'VERIFYING...';
        setTimeout(() => { localStorage.setItem('rf_shield_verified', 'true'); wrap.remove(); }, 1200);
      }
    });
  }, ${settings.delay * 1000});
})();
</script>`;
  };

  return (
    <div className="w-full space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* --- CONTROLS PANEL --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between">
                Shield Settings {loadingPlan && <Loader2 size={12} className="animate-spin text-indigo-500" />}
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 px-1">Main Heading</label>
                <input value={settings.headline} onChange={(e) => setSettings({...settings, headline: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 px-1">Sub-headline</label>
                <input value={settings.subheadline} onChange={(e) => setSettings({...settings, subheadline: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-1">Badge</label>
                  <input value={settings.badgeText} maxLength={2} onChange={(e) => setSettings({...settings, badgeText: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-1">Brand Color</label>
                  <input type="color" value={settings.color} onChange={(e) => setSettings({...settings, color: e.target.value})} className="w-full h-12 rounded-2xl cursor-pointer bg-white/[0.03] border border-white/10 p-1" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-black text-gray-500 px-1">
                  <span>Display Delay</span>
                  <span className="text-indigo-400 font-bold">{settings.delay}s</span>
                </div>
                <input type="range" min="0" max="30" value={settings.delay} onChange={(e) => setSettings({...settings, delay: parseInt(e.target.value)})} className="w-full accent-indigo-500" />
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-2 text-blue-400">
                 <ShieldCheck size={18} />
                 <span className="text-[10px] font-black uppercase italic">White Label</span>
               </div>
               <Switch checked={isPro} onCheckedChange={(c) => { if(c && !hasPremiumPlan) setShowUpgradeModal(true); else setIsPro(c); }} className="scale-75" />
            </div>
          </div>

          <button onClick={async () => { await navigator.clipboard.writeText(generateSnippet()); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2rem] hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest shadow-2xl">
            {copied ? <Check size={20}/> : <Code2 size={20}/>} {copied ? 'Snippet Copied!' : 'Generate Shield Code'}
          </button>
        </div>

        {/* --- LIVE PREVIEW AREA --- */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-end gap-3 px-2">
              <button onClick={() => setDevicePreview('desktop')} className={`p-4 rounded-2xl transition-all ${devicePreview === 'desktop' ? 'bg-white/10 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`}><Monitor size={20} /></button>
              <button onClick={() => setDevicePreview('mobile')} className={`p-4 rounded-2xl transition-all ${devicePreview === 'mobile' ? 'bg-white/10 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`}><Smartphone size={20} /></button>
          </div>

          <div className={`mx-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white rounded-[4rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)] relative border-[14px] border-gray-950 flex items-center justify-center
              ${devicePreview === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-[650px]'}`}
          >
              <div className="absolute inset-0 bg-gray-50 bg-[url('https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png')] bg-cover opacity-10 grayscale"></div>
              
              {isMounted && (
                <div className="relative z-30 w-full flex justify-center p-8 animate-in zoom-in duration-700">
                  <div className="bg-white w-full max-w-[360px] p-12 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] text-center">
                    <div className="w-16 h-16 rounded-[1.4rem] flex items-center justify-center text-white font-black text-2xl mb-8 mx-auto shadow-2xl" style={{ background: settings.color, boxShadow: `0 20px 40px -10px ${settings.color}88` }}>
                      {settings.badgeText}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight mb-3">{settings.headline}</h3>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-10">{settings.subheadline}</p>
                    
                    <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.2rem] py-5 mb-5 text-gray-300 font-black tracking-[0.4em] text-xl select-none">
                      000000
                    </div>
                    
                    <button disabled className="w-full py-5 rounded-[1.2rem] text-white font-black text-xs tracking-widest shadow-2xl opacity-90 uppercase" style={{ background: settings.color }}>
                      {settings.buttonText}
                    </button>
                    {!isPro && <div className="mt-8 text-[9px] text-gray-300 font-black uppercase tracking-[0.25em]">⚡ Powered by ReadyFlow</div>}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* --- AUDIT & SCHEDULER SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-32">
          <div className="lg:col-span-7 bg-[#0a0a0a] border-2 border-indigo-500/20 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-none tracking-tighter uppercase leading-none italic">Audit Your Store <br /><span className="text-gray-600 italic text-2xl md:text-3xl">Get the root cause.</span></h3>
              <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-lg font-medium italic">This tool is just a glimpse. Hum aapke data mein se root issues dhund ke bta denge.</p>
              <div className="flex flex-wrap items-center gap-6">
                  <div className="px-8 py-4 bg-white text-black font-black text-2xl rounded-2xl shadow-xl shadow-white/5">₹1,999 <span className="text-xs text-gray-400 line-through ml-2">₹4,999</span></div>
                  <button onClick={() => setIsSchedulerOpen(true)} className="font-black text-indigo-400 uppercase tracking-widest text-xs flex items-center gap-2 hover:text-indigo-300 transition-all">Schedule Audit Slot <ArrowRight size={16} /></button>
              </div>
          </div>
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] flex flex-col justify-center gap-6">
              <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-500 font-bold"><Zap size={16} className="text-indigo-500"/> Pincode Serviceability Analysis</div>
                  <div className="flex items-center gap-4 text-gray-500 font-bold"><Zap size={16} className="text-indigo-500"/> Fake Pattern Detection Setup</div>
                  <div className="flex items-center gap-4 text-gray-500 font-bold"><Zap size={16} className="text-indigo-500"/> Backend Ops Optimization</div>
              </div>
          </div>
      </div>

      {/* --- STICKY BANNER --- */}
      {showStickyBanner && !isBannerDismissed && (
        <div className="fixed bottom-6 left-4 right-4 md:bottom-10 z-[100] animate-in slide-in-from-bottom-10 duration-700 pointer-events-none">
            <div className="max-w-4xl mx-auto w-full pointer-events-auto">
              <div className="bg-[#111]/95 border-2 border-white/10 p-3 md:p-4 rounded-full shadow-[0_40px_100px_rgba(0,0,0,0.9)] backdrop-blur-xl flex items-center justify-between gap-4 group hover:border-indigo-500/40 transition-all duration-500">
                <div className="flex items-center gap-4 pl-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full overflow-hidden shrink-0 border border-white/10 shadow-lg group-hover:scale-110 transition-transform"><img src="/logo.png" alt="RF" className="w-full h-full object-cover" /></div>
                  <div className="hidden sm:block text-left text-white"><h4 className="text-sm font-black tracking-tight leading-none uppercase italic">This is just a glimpse.</h4><p className="text-[9px] text-gray-500 mt-1 font-bold uppercase tracking-widest italic">Get audited to fix root issues.</p></div>
                </div>
                <div className="flex items-center gap-2 pr-1">
                  <button onClick={() => setIsSchedulerOpen(true)} className="px-6 md:px-8 py-3 bg-white text-black font-black rounded-full text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl">Book Audit — ₹1999</button>
                  <button onClick={() => setIsBannerDismissed(true)} className="p-3 text-gray-600 hover:text-white transition-colors"><X size={16}/></button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* --- SCHEDULER MODAL --- */}
      {isSchedulerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl relative">
            <button onClick={() => setIsSchedulerOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all"><X size={28}/></button>
            <div className="p-10">
                {meetingStep === 1 ? (
                  <div className="animate-in slide-in-from-right duration-500">
                    <CalendarIcon className="text-indigo-500 mb-6" size={40} />
                    <h3 className="text-3xl font-black mb-2 text-white tracking-tighter uppercase">Select Audit Date</h3>
                    <div className="bg-white/5 rounded-3xl p-4 mb-8">
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                                const d = new Date(); d.setDate(d.getDate() + i);
                                return (
                                    <button key={i} onClick={() => { setSelectedDate(d); setMeetingStep(2); }} className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${selectedDate?.toDateString() === d.toDateString() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-white/10 text-gray-600 hover:text-white hover:border-indigo-500/30'}`}>
                                        <span className="text-[8px] uppercase font-black mb-1 opacity-60">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="text-sm font-black">{d.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right duration-500 text-center">
                    <Clock className="text-indigo-500 mb-6 mx-auto" size={40} />
                    <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Select Slot</h3>
                    <div className="grid grid-cols-1 gap-3 mb-10">
                        {["11 AM - 01 PM", "01 PM - 03 PM", "04 PM - 06 PM", "07 PM - 09 PM"].map(slot => (
                            <button key={slot} onClick={() => setSelectedTime(slot)} className={`p-5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${selectedTime === slot ? 'bg-white text-black border-white scale-105 shadow-xl' : 'bg-white/5 border-white/10 text-gray-500 hover:border-indigo-500/50'}`}>{slot}</button>
                        ))}
                    </div>
                    <button disabled={!selectedTime} onClick={handleScheduleSubmit} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl hover:bg-indigo-500 transition-all disabled:opacity-30 text-xs tracking-[0.2em] uppercase">Confirm on WhatsApp</button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- UPGRADE MODAL --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[4rem] w-full max-w-md text-center animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(59,130,246,0.1)]">
                <button onClick={() => setShowUpgradeModal(false)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-all"><X size={28}/></button>
                <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 rotate-12"><Lock size={45} className="text-blue-500" /></div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter leading-none uppercase">Premium Locked</h3>
                <p className="text-gray-400 mb-12 leading-relaxed text-sm font-medium italic">Advanced white-labeling and high-priority database updates are only for Premium partners.</p>
                <button onClick={() => router.push('/pricing')} className="w-full py-6 bg-orange-500 text-black font-black rounded-3xl hover:bg-orange-400 transition-all shadow-2xl shadow-orange-500/20 uppercase tracking-widest text-xs">Upgrade for ₹29</button>
            </div>
        </div>
      )}
    </div>
  );
}