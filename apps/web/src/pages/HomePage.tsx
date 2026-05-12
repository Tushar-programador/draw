import { useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThreeBackground } from "../components/ThreeBackground.js";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

/* ── icons ── */
function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" fill="#a78bfa" />
    </svg>
  );
}
function IconCanvas() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="#a78bfa" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="3" stroke="#a78bfa" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 018 0v4" stroke="#a78bfa" strokeWidth="2" />
      <circle cx="12" cy="16" r="1.5" fill="#a78bfa" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4.5 13H11l-1 9L20.5 11H14l-1-9z" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function IconAI() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#a78bfa" strokeWidth="2" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="#a78bfa" />
    </svg>
  );
}
function IconExport() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12M8 11l4 4 4-4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CanvasMockup() {
  return (
    <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1e293b" opacity="0.6" />
        </pattern>
        <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#7c3aed" floodOpacity="0.25" /></filter>
        <filter id="cardshadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.5" /></filter>
        <marker id="ah-purple" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#7c3aed" /></marker>
        <marker id="ah-blue" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#3b82f6" /></marker>
        <marker id="ah-green" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#22d3ee" /></marker>
        <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="760" height="430" rx="14" fill="#0d0d1a" stroke="#1a1a2e" strokeWidth="1.5" />
      <rect x="0" y="0" width="760" height="38" rx="14" fill="#111122" />
      <rect x="0" y="25" width="760" height="13" fill="#111122" />
      <circle cx="22" cy="19" r="5.5" fill="#ff5f56" /><circle cx="39" cy="19" r="5.5" fill="#febc2e" /><circle cx="56" cy="19" r="5.5" fill="#27c93f" />
      <rect x="90" y="8" width="240" height="21" rx="10.5" fill="#0a0a14" stroke="#1e293b" />
      <text x="180" y="23" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="system-ui">app.zenithcanvas.io/canvas</text>
      <rect x="0" y="38" width="760" height="392" fill="url(#dotgrid)" />
      <rect x="0" y="38" width="48" height="392" fill="#0e0e1c" />
      <rect x="8" y="56" width="32" height="32" rx="8" fill="#7c3aed" />
      <path d="M18 64 L18 79 L21.5 75 L24 82 L26.5 80.5 L24 73.5 L28 73.5 Z" fill="white" />
      <g filter="url(#cardshadow)"><rect x="68" y="62" width="148" height="112" rx="4" fill="#fef08a" /><rect x="68" y="62" width="148" height="20" rx="4" fill="#fde047" /><rect x="68" y="74" width="148" height="8" fill="#fde047" /></g>
      <text x="142" y="78" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="700" fontFamily="system-ui">User Story</text>
      <text x="80" y="102" fill="#713f12" fontSize="10" fontFamily="system-ui">As a designer, I want to</text>
      <text x="80" y="118" fill="#713f12" fontSize="10" fontFamily="system-ui">sketch ideas and instantly</text>
      <text x="80" y="134" fill="#713f12" fontSize="10" fontFamily="system-ui">turn them into real UI.</text>
      <path d="M 216 118 C 256 118 258 185 294 193" stroke="#7c3aed" strokeWidth="1.5" fill="none" markerEnd="url(#ah-purple)" strokeDasharray="5,3" opacity="0.7" />
      <g filter="url(#softshadow)"><rect x="294" y="155" width="186" height="90" rx="12" fill="url(#centerGrad)" stroke="#7c3aed" strokeWidth="1.5" /></g>
      <text x="387" y="198" textAnchor="middle" fill="#c4b5fd" fontSize="16" fontWeight="800" fontFamily="system-ui">Zenith Canvas</text>
      <text x="387" y="220" textAnchor="middle" fill="#7c6aad" fontSize="10" fontFamily="system-ui">Infinite whiteboard + AI</text>
      <rect x="289" y="150" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <rect x="476" y="150" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <rect x="289" y="239" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <rect x="476" y="239" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <path d="M 480 193 L 534 193" stroke="#3b82f6" strokeWidth="1.5" fill="none" markerEnd="url(#ah-blue)" />
      <g filter="url(#cardshadow)"><rect x="534" y="160" width="160" height="68" rx="10" fill="#0d1526" stroke="#3b82f6" strokeWidth="1.5" /></g>
      <text x="614" y="192" textAnchor="middle" fill="#60a5fa" fontSize="13" fontWeight="700" fontFamily="system-ui">Export</text>
      <text x="614" y="210" textAnchor="middle" fill="#1d4ed8" fontSize="10" fontFamily="system-ui">PNG - SVG - Code</text>
      <path d="M 387 245 L 387 294" stroke="#22d3ee" strokeWidth="1.5" fill="none" markerEnd="url(#ah-green)" />
      <g filter="url(#cardshadow)"><rect x="294" y="294" width="186" height="68" rx="10" fill="#060f14" stroke="#22d3ee" strokeWidth="1.5" /></g>
      <text x="387" y="325" textAnchor="middle" fill="#22d3ee" fontSize="13" fontWeight="700" fontFamily="system-ui">Collaborate</text>
      <text x="387" y="343" textAnchor="middle" fill="#155e75" fontSize="10" fontFamily="system-ui">Real-time, Yjs powered</text>
      <g filter="url(#cardshadow)"><rect x="592" y="64" width="148" height="88" rx="4" fill="#fce7f3" /><rect x="592" y="64" width="148" height="20" rx="4" fill="#f9a8d4" /><rect x="592" y="76" width="148" height="8" fill="#f9a8d4" /></g>
      <text x="666" y="80" textAnchor="middle" fill="#9d174d" fontSize="11" fontWeight="700" fontFamily="system-ui">AI Sketch to Code</text>
      <text x="602" y="104" fill="#831843" fontSize="9.5" fontFamily="system-ui">Draw a button -</text>
      <text x="602" y="119" fill="#831843" fontSize="9.5" fontFamily="system-ui">get React component</text>
      <text x="602" y="134" fill="#9d174d" fontSize="9" fontFamily="system-ui" fontWeight="600">Gemini + Ollama</text>
      <path d="M 592 110 C 550 110 518 168 480 190" stroke="#ec4899" strokeWidth="1.5" fill="none" markerEnd="url(#ah-purple)" strokeDasharray="4,3" opacity="0.6" />
      <g filter="url(#cardshadow)"><rect x="68" y="278" width="148" height="90" rx="4" fill="#dbeafe" /><rect x="68" y="278" width="148" height="20" rx="4" fill="#93c5fd" /><rect x="68" y="290" width="148" height="8" fill="#93c5fd" /></g>
      <text x="142" y="294" textAnchor="middle" fill="#1e3a8a" fontSize="11" fontWeight="700" fontFamily="system-ui">Local-First</text>
      <text x="78" y="316" fill="#1e40af" fontSize="9.5" fontFamily="system-ui">Your files on your device.</text>
      <text x="78" y="331" fill="#1e40af" fontSize="9.5" fontFamily="system-ui">Zero cloud storage.</text>
      <text x="78" y="360" fill="#2563eb" fontSize="9" fontWeight="600" fontFamily="system-ui">Saved locally</text>
      <path d="M 216 323 C 256 323 262 245 294 218" stroke="#3b82f6" strokeWidth="1.5" fill="none" markerEnd="url(#ah-blue)" strokeDasharray="5,3" opacity="0.6" />
      <rect x="0" y="395" width="760" height="35" fill="#0e0e1c" />
      <line x1="0" y1="395" x2="760" y2="395" stroke="#1a1a2e" strokeWidth="1" />
      <circle cx="64" cy="412" r="11" fill="#7c3aed" /><text x="64" y="416.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">A</text>
      <circle cx="85" cy="412" r="11" fill="#0891b2" /><text x="85" y="416.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">K</text>
      <circle cx="106" cy="412" r="11" fill="#059669" /><text x="106" y="416.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">S</text>
      <text x="124" y="416.5" fill="#475569" fontSize="11" fontFamily="system-ui">3 editing live</text>
      <rect x="340" y="400" width="80" height="24" rx="12" fill="#13131f" stroke="#1e293b" /><text x="380" y="416" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="system-ui">100%</text>
      <rect x="618" y="400" width="128" height="24" rx="12" fill="#0a140a" stroke="#166534" /><circle cx="633" cy="412" r="4.5" fill="#22c55e" /><text x="644" y="416" fill="#4ade80" fontSize="11" fontFamily="system-ui">Saved locally</text>
    </svg>
  );
}

const features: Array<{ icon: React.ReactNode; title: string; desc: string; tag?: string }> = [
  { icon: <IconCanvas />, title: "Infinite Canvas", desc: "Pan, zoom, and draw without limits. Sticky notes, shapes, connectors, freehand — every tool for visual thinking." },
  { icon: <IconLock />, title: "Local-First Storage", desc: "Drawings auto-save to your browser and export to your drive as .tldr files. Zero cloud, zero subscriptions.", tag: "Privacy" },
  { icon: <IconBolt />, title: "Real-Time Collaboration", desc: "Invite teammates and work together live. Every cursor, every shape synced instantly via Yjs." },
  { icon: <IconAI />, title: "AI Sketch to Code", desc: "Rough out a UI on canvas, hit one button, get production React back. Gemini or local Ollama.", tag: "Beta" },
  { icon: <IconExport />, title: "Export Anywhere", desc: "Save as .tldr, export PNG/SVG, or copy shapes as code. Your work is always portable." },
  { icon: <IconBolt />, title: "Self-Hostable", desc: "Run the entire stack on your own infra — Fastify, PostgreSQL, Hocuspocus, Socket.io included." },
];

function FeatureCard({ icon, title, desc, tag, index }: { icon: React.ReactNode; title: string; desc: string; tag?: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(124,58,237,0.55)", boxShadow: "0 18px 50px rgba(124,58,237,0.16)" }}
      style={{
        background: "rgba(13,13,26,0.82)",
        border: "1px solid #1a1a2e",
        borderRadius: 16,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        backdropFilter: "blur(14px)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -30, left: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: 52, height: 52, background: "rgba(124,58,237,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(124,58,237,0.22)" }}>
        {icon}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" }}>{title}</span>
        {tag && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 100, padding: "2px 8px" }}>{tag}</span>}
      </div>
      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>{desc}</p>
    </motion.div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 1 }}
    >
      <motion.div
        whileHover={{ scale: 1.12, rotate: 6 }}
        style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white" }}
      >
        {n}
      </motion.div>
      <span style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" }}>{title}</span>
      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>{desc}</p>
    </motion.div>
  );
}

function StatItem({ num, label }: { num: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.85 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num}</div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{label}</div>
    </motion.div>
  );
}

function PrivacyPill({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "rgba(13,13,26,0.8)", border: "1px solid #1a1a2e", borderRadius: 12, backdropFilter: "blur(8px)" }}
    >
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: "#94a3b8" }}>{text}</span>
    </motion.div>
  );
}

const CSS = `
  .zc-page { position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#06060e;color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#1e293b #06060e; }
  .zc-nav { position:sticky;top:0;z-index:50;background:rgba(6,6,14,0.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.05); }
  .zc-nav-inner { max-width:1160px;margin:0 auto;padding:0 28px;height:62px;display:flex;align-items:center;gap:20px; }
  .zc-logo { display:flex;align-items:center;gap:9px;font-size:17px;font-weight:700;letter-spacing:-0.3px;color:#f0f0f0;flex-shrink:0; }
  .zc-nav-links { display:flex;gap:4px;margin-left:12px;flex:1; }
  .zc-nav-link { padding:6px 14px;color:#64748b;font-size:14px;background:none;border:none;cursor:pointer;border-radius:8px;transition:color 0.15s,background 0.15s;font-family:inherit; }
  .zc-nav-link:hover { color:#cbd5e1;background:rgba(255,255,255,0.05); }
  .zc-nav-cta { display:flex;align-items:center;gap:10px;flex-shrink:0; }
  .zc-btn-ghost { padding:7px 16px;background:none;border:1px solid #1e293b;border-radius:8px;color:#94a3b8;font-size:13.5px;cursor:pointer;font-family:inherit;transition:border-color 0.15s,color 0.15s; }
  .zc-btn-ghost:hover { border-color:#334155;color:#f0f0f0; }
  .zc-btn-primary { padding:7px 18px;background:linear-gradient(135deg,#7c3aed,#3b82f6);border:none;border-radius:8px;color:#fff;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit; }
  .zc-gradient-text { background:linear-gradient(135deg,#a78bfa 0%,#60a5fa 60%,#34d399 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
  .zc-badge-dot { width:6px;height:6px;border-radius:50%;background:#a78bfa;animation:pulse 2s ease-in-out infinite;display:inline-block; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
  .zc-stats { background:rgba(10,10,20,0.9);border-top:1px solid #111827;border-bottom:1px solid #111827;position:relative;z-index:1; }
  .zc-stats-inner { max-width:1160px;margin:0 auto;padding:44px 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:32px; }
  .zc-section { max-width:1160px;margin:0 auto;padding:100px 28px;position:relative;z-index:1; }
  .zc-section-eyebrow { font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#7c3aed;margin-bottom:14px; }
  .zc-section-title { font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-0.03em;color:#f0f0f0;margin-bottom:16px;line-height:1.15; }
  .zc-section-sub { font-size:16px;color:#475569;max-width:500px;line-height:1.6;margin-bottom:56px; }
  .zc-features-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px; }
  .zc-how { background:rgba(9,9,20,0.92);border-top:1px solid #111827;border-bottom:1px solid #111827;padding:100px 28px;position:relative;z-index:1; }
  .zc-how-inner { max-width:1160px;margin:0 auto; }
  .zc-steps { display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:40px;margin-top:56px; }
  .zc-privacy-wrap { max-width:1160px;margin:0 auto;padding:100px 28px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:1; }
  @media(max-width:768px){.zc-privacy-wrap{grid-template-columns:1fr;gap:40px;}}
  .zc-privacy-pills { display:flex;flex-direction:column;gap:14px; }
  .zc-cta-section { text-align:center;padding:120px 28px;background:rgba(9,9,20,0.92);border-top:1px solid #111827;position:relative;overflow:hidden;z-index:1; }
  .zc-cta-glow { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 70%);pointer-events:none; }
  .zc-footer { background:#06060e;border-top:1px solid #111827;padding:40px 28px;position:relative;z-index:1; }
  .zc-footer-inner { max-width:1160px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px; }
  .zc-marquee-wrap { overflow:hidden;border-top:1px solid #111827;border-bottom:1px solid #111827;padding:18px 0;background:rgba(8,8,18,0.9);position:relative;z-index:1; }
  .zc-marquee { display:flex;gap:48px;animation:marquee 22s linear infinite;white-space:nowrap;width:max-content; }
  .zc-marquee-item { font-size:13px;color:#334155;letter-spacing:0.04em;text-transform:uppercase;font-weight:600;flex-shrink:0; }
  @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes borderShimmer { 0%,100%{box-shadow:0 0 40px rgba(124,58,237,0.15),0 32px 80px rgba(0,0,0,0.6)} 50%{box-shadow:0 0 60px rgba(59,130,246,0.22),0 32px 80px rgba(0,0,0,0.6)} }
`;

const marqueeItems = [
  "Infinite canvas","Local-first","Real-time sync","AI sketch to code","Self-hostable",
  "Zero cloud storage","Yjs powered","Open source",
  "Infinite canvas","Local-first","Real-time sync","AI sketch to code","Self-hostable",
  "Zero cloud storage","Yjs powered","Open source",
];

export function HomePage({ onGetStarted, onLogin }: Props) {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: pageRef });
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.93]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.6]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, 48]);

  /* GSAP ScrollTrigger — stagger steps when section scrolls into view */
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const steps = page.querySelectorAll<HTMLElement>("[data-step]");
    if (!steps.length) return;

    // Give elements initial state
    gsap.set(steps, { opacity: 0, y: 44 });

    const st = ScrollTrigger.create({
      trigger: page.querySelector("#how") as Element,
      scroller: page,
      start: "top 72%",
      once: true,
      onEnter: () => {
        gsap.to(steps, {
          opacity: 1,
          y: 0,
          stagger: 0.14,
          duration: 0.72,
          ease: "power3.out",
        });
      },
    });

    /* GSAP parallax on stats numbers */
    const statNums = page.querySelectorAll<HTMLElement>("[data-stat-num]");
    statNums.forEach((el) => {
      gsap.fromTo(
        el,
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: el,
            scroller: page,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    return () => { st.kill(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  /* Framer Motion hero variants */
  const heroVariants = { hidden: {}, show: { transition: { staggerChildren: 0.13 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  };

  const scrollTo = (id: string) =>
    pageRef.current?.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <ThreeBackground />

      <div ref={pageRef} className="zc-page">

        {/* NAV */}
        <motion.nav className="zc-nav" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>
          <div className="zc-nav-inner">
            <span className="zc-logo"><IconStar />Zenith Canvas</span>
            <div className="zc-nav-links">
              <button className="zc-nav-link" onClick={() => scrollTo("#features")}>Features</button>
              <button className="zc-nav-link" onClick={() => scrollTo("#how")}>How it works</button>
              <button className="zc-nav-link" onClick={() => scrollTo("#privacy")}>Privacy</button>
            </div>
            <div className="zc-nav-cta">
              <button className="zc-btn-ghost" onClick={onLogin}>Log in</button>
              <motion.button className="zc-btn-primary" onClick={onGetStarted} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                Get started free →
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* HERO */}
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 28px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
          <motion.div variants={heroVariants} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 100, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: 12.5, fontWeight: 500 }}>
                <span className="zc-badge-dot" />
                Now in beta &nbsp;·&nbsp; Free forever
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(42px,6.5vw,84px)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.04em", marginBottom: 22, color: "#f0f0f0", maxWidth: 840 }}>
              Draw. Collaborate.{" "}<span className="zc-gradient-text">Ship.</span>
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: "clamp(16px,2vw,20px)", color: "#64748b", lineHeight: 1.65, maxWidth: 600, marginBottom: 36 }}>
              The infinite whiteboard for teams who move fast. Sketch ideas, build diagrams, and turn
              drawings into working code — all from one place. Your files never leave your device.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
              <motion.button onClick={onGetStarted} whileHover={{ scale: 1.05, boxShadow: "0 10px 36px rgba(124,58,237,0.4)" }} whileTap={{ scale: 0.97 }}
                style={{ padding: "13px 30px", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Start drawing free →
              </motion.button>
              <motion.button onClick={() => scrollTo("#features")} whileHover={{ borderColor: "#334155", color: "#f0f0f0" }}
                style={{ padding: "13px 24px", background: "none", border: "1px solid #1e293b", borderRadius: 10, color: "#94a3b8", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                See what's inside
              </motion.button>
            </motion.div>

            {/* hero visual with scroll parallax */}
            <motion.div
              ref={heroVisualRef}
              variants={fadeUp}
              style={{
                width: "100%", maxWidth: 880, borderRadius: 16, overflow: "hidden",
                boxShadow: "0 0 0 1px #1a1a2e, 0 32px 80px rgba(0,0,0,0.7)",
                animation: "borderShimmer 4s ease-in-out infinite",
                scale: heroScale, opacity: heroOpacity, y: heroY,
              }}
            >
              <CanvasMockup />
            </motion.div>
          </motion.div>
        </section>

        {/* MARQUEE */}
        <div className="zc-marquee-wrap" style={{ marginTop: 80 }}>
          <div className="zc-marquee">
            {marqueeItems.map((item, i) => <span key={i} className="zc-marquee-item">{item} &nbsp;·</span>)}
          </div>
        </div>

        {/* STATS */}
        <div className="zc-stats">
          <div className="zc-stats-inner">
            {[
              { num: "∞", label: "Canvas size" },
              { num: "0 ms", label: "Network lag (local-first)" },
              { num: "0 GB", label: "Cloud storage used" },
              { num: "100%", label: "Your data, your device" },
            ].map((s) => (
              <div key={s.label} data-stat-num style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="zc-section">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55 }}>
            <div className="zc-section-eyebrow">Everything you need</div>
            <h2 className="zc-section-title">Built for how you actually work</h2>
            <p className="zc-section-sub">No bloat, no paywalls, no surveillance. Just a fast, private canvas with the features that matter.</p>
          </motion.div>
          <div className="zc-features-grid">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="zc-how">
          <div className="zc-how-inner">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
              <div className="zc-section-eyebrow">Simple by design</div>
              <h2 className="zc-section-title">Up and running in seconds</h2>
            </motion.div>
            <div className="zc-steps">
              {[
                { title: "Create your account", desc: "Sign up with email — no credit card, no trial period. Your account is yours forever." },
                { title: "Open your canvas", desc: "A blank infinite whiteboard is ready the moment you log in. Start with a sticky note or a diagram." },
                { title: "Save to your drive", desc: 'Hit "Save to file" and pick where the .tldr lives. Your machine, your folder, your rules.' },
                { title: "Invite your team", desc: "Share a link and collaborate in real time. Every edit syncs live — no refresh needed." },
              ].map((s, i) => (
                <div key={s.title} data-step>
                  <Step n={i + 1} title={s.title} desc={s.desc} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section id="privacy">
          <div className="zc-privacy-wrap">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}>
              <div className="zc-section-eyebrow">Privacy first</div>
              <h2 className="zc-section-title">Your canvas.<br /><span className="zc-gradient-text">Your rules.</span></h2>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.65, marginTop: 16 }}>
                Most whiteboards store your designs on their servers, sell analytics, and lock you into
                subscriptions. Zenith Canvas works the other way — drawing data lives on your device by default.
              </p>
            </motion.div>
            <div className="zc-privacy-pills">
              {[
                "Drawings auto-save to your browser's localStorage",
                "Export to .tldr files on your own drive — offline capable",
                "Server stores only your account and document title",
                "Real-time sync via your own Hocuspocus instance",
                "AI is optional — use local Ollama for 100% private",
                "Open source — self-host the entire stack",
              ].map((text, i) => <PrivacyPill key={text} text={text} index={i} />)}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="zc-cta-section">
          <div className="zc-cta-glow" />
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 14 }}>
              The whiteboard that <span className="zc-gradient-text">respects you.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#475569", marginBottom: 36 }}>No storage limits. No subscriptions. No tracking. Just your ideas.</p>
            <motion.button onClick={onGetStarted} whileHover={{ scale: 1.05, boxShadow: "0 14px 50px rgba(124,58,237,0.45)" }} whileTap={{ scale: 0.97 }}
              style={{ padding: "16px 40px", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em" }}>
              Start drawing for free →
            </motion.button>
            <p style={{ marginTop: 16, fontSize: 12.5, color: "#334155" }}>No credit card required. Free forever.</p>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="zc-footer">
          <div className="zc-footer-inner">
            <span className="zc-logo" style={{ fontSize: 14 }}><IconStar />Zenith Canvas</span>
            <span style={{ fontSize: 13, color: "#334155" }}>2026 Zenith Canvas. Your canvas, your rules.</span>
            <div style={{ display: "flex", gap: 20 }}>
              <button onClick={onGetStarted} style={{ fontSize: 13, color: "#334155", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get started</button>
              <button onClick={onLogin} style={{ fontSize: 13, color: "#334155", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Log in</button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
