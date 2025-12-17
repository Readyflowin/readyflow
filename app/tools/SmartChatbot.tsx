"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Copy, Check, Plus, Trash2, Zap, Crown, Lock, Smartphone, Palette, ChevronDown, Globe, FileText, Users, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase"; 
import { trackToolUsage } from "@/lib/db"; 
import { doc, getDoc } from "firebase/firestore"; 

// --- CONSTANTS ---
const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
];

const SmartChatbot = () => {
  const router = useRouter();

  // --- STATE ---
  const [hasPremiumPlan, setHasPremiumPlan] = useState(false); // DB Status
  const [viewMode, setViewMode] = useState<'free' | 'premium'>('free'); // UI Toggle
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false); // NEW: Controls the custom popup

  // --- INPUTS ---
  const [country, setCountry] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [welcomeMsg, setWelcomeMsg] = useState("Hi! How can I help you?");
  
  // Data Collection
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteAbout, setWebsiteAbout] = useState("");
  const [joinGroup, setJoinGroup] = useState(true);

  // Premium Inputs (Now Accessible to All for Preview)
  const [botName, setBotName] = useState("Mimi Support");
  const [brandColor, setBrandColor] = useState("#FF6B6B"); 
  const [questions, setQuestions] = useState([
    { id: 1, q: "Track my order", a: "You can track your order status in the 'My Orders' section." },
    { id: 2, q: "Talk to agent", a: "Opening WhatsApp to connect you with a human agent..." }
  ]);

  // --- PREVIEW STATE ---
  const [previewMessages, setPreviewMessages] = useState<{type: 'bot'|'user', text: string}[]>([]);
  const [previewInput, setPreviewInput] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // --- 1. CHECK SUBSCRIPTION STATUS ON LOAD ---
  useEffect(() => {
    const checkPlan = async () => {
        if (!auth.currentUser) {
            setLoadingPlan(false);
            return;
        }
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.plan === "Premium") {
                    setHasPremiumPlan(true);
                    setViewMode('premium'); // Auto-switch to premium view for paid users
                }
            }
        } catch (error) {
            console.error("Error fetching plan:", error);
        }
        setLoadingPlan(false);
    };
    checkPlan();
  }, []);

  // Sync Preview
  useEffect(() => { setPreviewMessages([{ type: 'bot', text: welcomeMsg }]); }, [viewMode, welcomeMsg]);

  // --- HANDLERS ---
  
  // Redirect to Pricing if they try to unlock
  const handleUnlock = () => {
      router.push("/pricing");
  };

  // Secure View Toggle
  const handleViewToggle = (mode: 'free' | 'premium') => {
      // NOTE: We allow them to toggle freely now so they can SEE the premium features
      // But we block the COPY action later.
      setViewMode(mode);
  };

  // Helper: Sanitizes phone number
  const getFormattedNumber = () => {
      let raw = phoneNumber.replace(/\D/g, ''); 
      const countryClean = country.replace('+', '');
      if (raw.startsWith(countryClean)) raw = raw.substring(countryClean.length);
      if (raw.startsWith('0')) raw = raw.substring(1);
      return countryClean + raw;
  };

  const handlePreviewSend = () => {
    if(!previewInput.trim()) return;
    setPreviewMessages(prev => [...prev, { type: 'user', text: previewInput }]);
    setTimeout(() => {
        const fullNumber = getFormattedNumber();
        const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(previewInput)}`;
        window.open(url, '_blank');
        setPreviewInput("");
    }, 800);
  };

  const handleChipClick = (q: string, a: string) => {
    setPreviewMessages(prev => [...prev, { type: 'user', text: q }]);
    setTimeout(() => {
        setPreviewMessages(prev => [...prev, { type: 'bot', text: a }]);
    }, 600);
  };

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), q: "", a: "" }]);
  const updateQuestion = (id: number, field: 'q' | 'a', val: string) => {
    setQuestions(questions.map(item => item.id === id ? { ...item, [field]: val } : item));
  };
  const removeQuestion = (id: number) => setQuestions(questions.filter(item => item.id !== id));

  // --- GENERATOR: PREMIUM (EXACT MIMI CODE + HIDDEN BACKLINK) ---
  const generatePremiumCode = () => {
    const fullNum = getFormattedNumber();
    const qaString = questions.reduce((acc, curr) => acc + `'${curr.q}': '${curr.a}',\n     `, "");

    // THE SEO HACK: Invisible link (opacity 0.01) that passes link juice but user doesn't see.
    const hiddenBacklink = `<a href="https://readyflow.in" target="_blank" style="position:absolute; bottom:0; left:0; width:100%; text-align:center; opacity:0.01; pointer-events:none; z-index:-1; font-size:1px; color:inherit;">WhatsApp Chatbot by ReadyFlow</a>`;

    return `
<style>
  #mimi-widget * { box-sizing: border-box; outline: none; }
  :root { --mimi-accent: ${brandColor}; --mimi-grad: linear-gradient(135deg, ${brandColor}, ${brandColor}dd); --mimi-bg-user: #F3F4F6; --mimi-bg-bot: #FFF0EE; --mimi-font: "Inter", sans-serif; }
  #mimi-toggle { position: fixed; right: 20px; bottom: 20px; width: 60px; height: 60px; border-radius: 50%; background: var(--mimi-grad); border: none; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); z-index: 999999; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
  #mimi-toggle:hover { transform: scale(1.05); }
  #mimi-chat { position: fixed; right: 20px; bottom: 90px; width: 360px; max-width: calc(100% - 40px); height: 600px; max-height: 75vh; background: white; border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); z-index: 999999; font-family: var(--mimi-font); display: flex; flex-direction: column; opacity: 0; pointer-events: none; transform: translateY(10px); transition: all 0.2s ease; }
  #mimi-chat.open { opacity: 1; pointer-events: all; transform: translateY(0); }
  .mimi-header { background: var(--mimi-grad); padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: white; }
  .mimi-avatar { width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
  .mimi-body { flex: 1; background: #fff; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
  .mimi-row { display: flex; width: 100%; align-items: flex-end; }
  .mimi-row.bot { justify-content: flex-start; } .mimi-row.user { justify-content: flex-end; }
  .mimi-bubble { max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; position: relative; }
  .mimi-row.bot .mimi-bubble { background: var(--mimi-bg-bot); color: #333; border-bottom-left-radius: 4px; }
  .mimi-row.user .mimi-bubble { background: var(--mimi-bg-user); color: #333; border-bottom-right-radius: 4px; }
  .mimi-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
  .mimi-chip { border: 1px solid #eee; padding: 8px 12px; border-radius: 20px; font-size: 13px; cursor: pointer; background: white; color: #333; }
  .mimi-chip:hover { border-color: var(--mimi-accent); color: var(--mimi-accent); }
  .mimi-footer { padding: 12px; border-top: 1px solid #eee; display: flex; gap: 8px; background: white; }
  #mimi-input { flex: 1; padding: 10px 14px; border-radius: 20px; border: 1px solid #ddd; font-size: 14px; }
  #mimi-send { width: 40px; height: 40px; background: var(--mimi-accent); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
<div id="mimi-widget">
  <button id="mimi-toggle"><svg viewBox="0 0 24 24" width="28" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button>
  <div id="mimi-chat">
    <div class="mimi-header">
      <div class="mimi-avatar">${botName.charAt(0)}</div>
      <div><div style="font-weight:700; font-size:15px;">${botName}</div><div style="font-size:11px; opacity:0.9;">Online</div></div>
      <button onclick="document.getElementById('mimi-chat').classList.remove('open')" style="margin-left:auto;background:none;border:none;color:white;font-size:24px;cursor:pointer;">✕</button>
    </div>
    <div class="mimi-body" id="mimi-body">
      <div class="mimi-chips" id="mimi-chips">${questions.map(q => `<div class="mimi-chip" data-msg="${q.q}">${q.q}</div>`).join('')}</div>
      <div id="mimi-msgs" style="display:flex; flex-direction:column; gap:12px;"></div>
    </div>
    <div class="mimi-footer"><input type="text" id="mimi-input" placeholder="Type here..." /><button id="mimi-send">➤</button></div>
    ${hiddenBacklink}
  </div>
</div>
<script>
(function(){
  const PHONE = '${fullNum}'; const QA = { ${qaString} };
  const el = (id) => document.getElementById(id);
  const scroll = () => { const body = el('mimi-body'); setTimeout(() => body.scrollTop = body.scrollHeight, 50); };
  function add(side, text) {
    const div = document.createElement('div'); div.className = \`mimi-row \${side}\`;
    const avatar = side === 'bot' ? \`<div class="mimi-avatar" style="width:28px;height:28px;font-size:12px;margin-right:8px;background:var(--mimi-accent);color:white;">${botName.charAt(0)}</div>\` : '';
    div.innerHTML = \`\${avatar}<div class="mimi-bubble">\${text}</div>\`;
    el('mimi-msgs').appendChild(div); scroll();
  }
  el('mimi-toggle').onclick = () => { el('mimi-chat').classList.add('open'); if(!el('mimi-msgs').children.length) add('bot', "${welcomeMsg}"); };
  el('mimi-chips').onclick = (e) => { const t = e.target.dataset.msg; if(t) { add('user', t); setTimeout(() => { add('bot', QA[t]); if(t.toLowerCase().includes('agent')) window.open('https://wa.me/'+PHONE, '_blank'); }, 600); } };
  el('mimi-send').onclick = () => { const v = el('mimi-input').value; if(v) { add('user', v); el('mimi-input').value=''; setTimeout(() => window.open('https://wa.me/'+PHONE+'?text='+encodeURIComponent(v), '_blank'), 1000); } };
})();
</script>`.trim();
  };

  // --- GENERATOR: FREE ---
  const generateFreeCode = () => {
    const fullNum = getFormattedNumber();
    return `<div id="rf-widget" style="position:fixed;bottom:20px;right:20px;z-index:9999;font-family:sans-serif;">
  <button onclick="document.getElementById('rf-win').style.display=document.getElementById('rf-win').style.display==='block'?'none':'block'" style="width:60px;height:60px;border-radius:50%;background:#25D366;border:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);cursor:pointer;display:flex;align-items:center;justify-content:center;">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
  </button>
  <div id="rf-win" style="display:none;position:absolute;bottom:80px;right:0;width:300px;background:white;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1);overflow:hidden;">
    <div style="background:#25D366;padding:15px;color:white;font-weight:bold;">Chat with us</div>
    <div style="padding:15px;background:#f9f9f9;">
       <div style="background:white;padding:10px;border-radius:8px;font-size:14px;color:#333;margin-bottom:15px;">${welcomeMsg}</div>
       <textarea id="rf-msg" placeholder="Type here..." style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;height:60px;margin-bottom:10px;"></textarea>
       <button onclick="window.open('https://wa.me/${fullNum}?text='+encodeURIComponent(document.getElementById('rf-msg').value),'_blank')" style="width:100%;background:#25D366;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:bold;">Send to WhatsApp ➤</button>
    </div>
    <a href="https://readyflow.in" target="_blank" style="display:block;text-align:center;padding:8px;font-size:10px;color:#888;text-decoration:none;background:white;border-top:1px solid #eee;">⚡ Powered by ReadyFlow</a>
  </div>
</div>`.trim();
  };

  const handleCopy = async () => {
    // 1. SECURITY: Block Copying Premium Code if NOT Premium
    if (viewMode === 'premium' && !hasPremiumPlan) {
        // CHANGED: Instead of confirm(), show the custom modal
        setShowPremiumModal(true);
        return; // STOP execution
    }

    const codeToCopy = (viewMode === 'premium' && hasPremiumPlan) ? generatePremiumCode() : generateFreeCode();
    
    navigator.clipboard.writeText(codeToCopy).then(async () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (auth.currentUser) await trackToolUsage(auth.currentUser.uid, 'smartChatbot'); 
    });
  };

  return (
    <>
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      {/* LEFT: EDITOR */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                <div className={`p-2 rounded-lg ${viewMode === 'premium' ? 'bg-orange-500' : 'bg-green-500/20'}`}>
                    <Smartphone className={viewMode === 'premium' ? "text-white" : "text-green-500"} size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Configure Widget</h2>
                    <p className="text-xs text-gray-400">{viewMode === 'premium' ? "Advanced AI Customization" : "Basic WhatsApp Link"}</p>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                {/* Inputs */}
                <div>
                    <label className="text-sm text-gray-400 block mb-2">WhatsApp Number</label>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-12 bg-black/50 border border-white/10 rounded-xl pl-3 pr-8 text-white appearance-none cursor-pointer focus:border-green-500 outline-none">
                                {COUNTRY_CODES.map((c) => (<option key={c.name} value={c.code}>{c.flag} {c.code}</option>))}
                            </select>
                            <ChevronDown className="absolute right-2 top-4 text-gray-500 pointer-events-none" size={14}/>
                        </div>
                        <input type="tel" placeholder="98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1 h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-green-500 font-mono" />
                    </div>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-2">Welcome Message</label>
                    <input type="text" value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)} className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-green-500" />
                </div>
            </div>

            {/* PREMIUM FIELDS (NOW UNLOCKED FOR PREVIEW) */}
            <div className={`relative pt-6 border-t border-white/10 transition-all duration-300 ${viewMode === 'free' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Brand Color</label>
                            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/10">
                                <Palette size={16} className="text-gray-500 ml-2"/>
                                <input type="color" value={brandColor} onChange={(e)=>setBrandColor(e.target.value)} className="w-full h-6 bg-transparent cursor-pointer" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Bot Name</label>
                            <input type="text" value={botName} onChange={(e)=>setBotName(e.target.value)} className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-orange-400 block mb-3 flex items-center gap-2"><Zap size={14}/> Smart Q&A Chips</label>
                        <div className="space-y-3">
                            {questions.map((q) => (
                                /* FIX: Added flex-col sm:flex-row to handle mobile overlap */
                                <div key={q.id} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-white/5 sm:border-none">
                                    <input placeholder="Question" value={q.q} onChange={(e)=>updateQuestion(q.id,'q',e.target.value)} className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                    <input placeholder="Answer" value={q.a} onChange={(e)=>updateQuestion(q.id,'a',e.target.value)} className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300" />
                                    <button onClick={()=>removeQuestion(q.id)} className="text-red-400 p-2 self-end sm:self-center"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button onClick={addQuestion} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">+ Add Question</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* CODE OUTPUT */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-300">Your Installation Code</h3>
                {/* FIXED: Replaced isPremium with hasPremiumPlan here */}
                <button onClick={handleCopy} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${hasPremiumPlan || viewMode === 'free' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {copied ? <Check size={16}/> : <Copy size={16}/>} 
                    {copied ? "Copied!" : (viewMode === 'premium' && !hasPremiumPlan ? "Unlock to Copy" : "Copy Code")}
                </button>
            </div>
            
            {/* CODE PREVIEW BOX */}
            <div className="bg-black/50 rounded-xl p-4 overflow-hidden h-32 relative group">
                <code className={`text-xs text-gray-500 font-mono break-all opacity-50 ${viewMode === 'premium' && !hasPremiumPlan ? 'blur-[4px] select-none' : ''}`}>
                    {(viewMode === 'premium' ? generatePremiumCode() : generateFreeCode()).slice(0, 400) + "..."}
                </code>
                
                {/* GATE OVERLAY if trying to view premium code without paying */}
                {viewMode === 'premium' && !hasPremiumPlan && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-gray-900 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
                            <Lock size={14} className="text-orange-500"/>
                            <span className="text-xs font-bold text-white">Code Hidden</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="lg:col-span-5 space-y-6 sticky top-24">
        <div className="bg-white/5 p-1 rounded-xl flex border border-white/10">
            <button onClick={() => handleViewToggle('free')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'free' ? 'bg-[#25D366] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Free View</button>
            <button onClick={() => handleViewToggle('premium')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'premium' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Premium View <Crown size={14} /></button>
        </div>
        
        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden min-h-[500px] relative flex flex-col">
            <div className="bg-[#1a1a1a] px-4 py-2 text-[10px] text-center text-gray-500 border-b border-white/5">{viewMode === 'free' ? "Basic Widget Preview" : "Premium AI Bot Preview"}</div>
            <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-black p-6">
                <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 group animate-in fade-in slide-in-from-bottom duration-500">
                     <div className={`bg-white text-black w-[280px] rounded-xl shadow-2xl overflow-hidden mb-2 origin-bottom-right transition-all duration-300 ease-in-out transform ${isPreviewOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}`}>
                        <div className="p-3 text-white flex gap-3 items-center transition-colors duration-300" style={{background: viewMode === 'premium' ? brandColor : '#25D366'}}>
                            {viewMode === 'premium' && <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{botName.charAt(0)}</div>}
                            <div><div className="font-bold text-sm">{viewMode === 'premium' ? botName : "Chat with us"}</div>{viewMode === 'premium' && <div className="text-[10px] opacity-80">Online</div>}</div>
                            <button onClick={()=>setIsPreviewOpen(false)} className="ml-auto text-white hover:opacity-80">✕</button>
                        </div>
                        <div ref={chatBodyRef} className="h-60 bg-gray-50 p-3 flex flex-col gap-2 text-xs overflow-y-auto">
                            {previewMessages.map((msg, i) => (<div key={i} className={`p-2 rounded-lg max-w-[90%] animate-in slide-in-from-bottom-2 duration-300 ${msg.type === 'bot' ? 'self-start bg-white border border-gray-100 shadow-sm' : 'self-end bg-[#dcf8c6]'}`}>{msg.text}</div>))}
                            {viewMode === 'premium' && (<div className="flex flex-wrap gap-1 mt-2">{questions.map(q => (<button key={q.id} onClick={() => handleChipClick(q.q, q.a)} className="border border-gray-200 bg-white px-2 py-1 rounded-full text-[10px] hover:border-orange-500 hover:text-orange-500 transition-colors">{q.q}</button>))}</div>)}
                        </div>
                        <div className="p-2 border-t flex gap-2 bg-white">
                            <input value={previewInput} onChange={(e) => setPreviewInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePreviewSend()} placeholder="Type..." className="w-full border p-1 rounded text-[10px] outline-none bg-gray-50"/>
                            <button onClick={handlePreviewSend} className="text-white px-2 rounded text-[10px] font-bold" style={{background: viewMode === 'premium' ? brandColor : '#25D366'}}>➤</button>
                        </div>
                     </div>
                     <div onClick={()=>setIsPreviewOpen(!isPreviewOpen)} className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform" style={{background: viewMode === 'premium' ? brandColor : '#25D366'}}><MessageSquare size={28} /></div>
                </div>
            </div>
        </div>

        {!hasPremiumPlan && !loadingPlan && (
            <div className="bg-gradient-to-r from-orange-900/40 to-black border border-orange-500/50 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <h3 className="text-lg font-bold text-white mb-2">Manual Replies Kill Sales.</h3>
                <p className="text-xs text-gray-400 mb-4">Don't let customers wait while you sleep.</p>
                <button onClick={() => router.push("/pricing")} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">Upgrade to Unlock & Remove Watermark - ₹29</button>
            </div>
        )}
      </div>

      {/* --- NEW: CUSTOM PREMIUM MODAL --- */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111] border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center relative animate-in zoom-in-95 duration-200">
                <button onClick={() => setShowPremiumModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} className="text-orange-500" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Premium Feature Locked</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    This advanced Chatbot with <strong>Smart Q&A Chips</strong> and <strong>Custom Branding</strong> is only available on the Pro Plan.
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => router.push('/pricing')} 
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
                    >
                        Upgrade Now - ₹29
                    </button>
                    <button 
                        onClick={() => setShowPremiumModal(false)}
                        className="w-full py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
    </>
  );
};

export default SmartChatbot;