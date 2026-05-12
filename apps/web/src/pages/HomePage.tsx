interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

/* ── inline SVG icons ── */
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

/* ── canvas preview SVG ── */
function CanvasMockup() {
  return (
    <svg
      viewBox="0 0 760 430"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 760, display: "block" }}
    >
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1e293b" opacity="0.6" />
        </pattern>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#7c3aed" floodOpacity="0.25" />
        </filter>
        <filter id="cardshadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <marker id="ah-purple" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#7c3aed" />
        </marker>
        <marker id="ah-blue" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#3b82f6" />
        </marker>
        <marker id="ah-green" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#22d3ee" />
        </marker>
        <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="centerBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* ── browser frame ── */}
      <rect x="0" y="0" width="760" height="430" rx="14" fill="#0d0d1a" stroke="#1a1a2e" strokeWidth="1.5" />

      {/* ── browser chrome ── */}
      <rect x="0" y="0" width="760" height="38" rx="14" fill="#111122" />
      <rect x="0" y="25" width="760" height="13" fill="#111122" />
      {/* traffic lights */}
      <circle cx="22" cy="19" r="5.5" fill="#ff5f56" />
      <circle cx="39" cy="19" r="5.5" fill="#febc2e" />
      <circle cx="56" cy="19" r="5.5" fill="#27c93f" />
      {/* address bar */}
      <rect x="90" y="8" width="240" height="21" rx="10.5" fill="#0a0a14" stroke="#1e293b" />
      <circle cx="105" cy="18.5" r="4" fill="none" stroke="#334155" strokeWidth="1" />
      <text x="180" y="23" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="system-ui, sans-serif">
        app.zenithcanvas.io/canvas
      </text>
      {/* toolbar icons top right */}
      <rect x="650" y="9" width="22" height="22" rx="5" fill="#1e293b" opacity="0.7" />
      <rect x="678" y="9" width="22" height="22" rx="5" fill="#1e293b" opacity="0.7" />
      <rect x="706" y="9" width="22" height="22" rx="5" fill="#1e293b" opacity="0.7" />
      <circle cx="718" cy="19" r="5" fill="#7c3aed" opacity="0.8" />

      {/* ── canvas area ── */}
      <rect x="0" y="38" width="760" height="392" fill="url(#dotgrid)" />

      {/* ── left toolbar ── */}
      <rect x="0" y="38" width="48" height="392" fill="#0e0e1c" />
      <line x1="48" y1="38" x2="48" y2="430" stroke="#1a1a2e" strokeWidth="1" />
      {/* tool buttons */}
      <rect x="8" y="56" width="32" height="32" rx="8" fill="#7c3aed" />
      {/* cursor icon */}
      <path d="M18 64 L18 79 L21.5 75 L24 82 L26.5 80.5 L24 73.5 L28 73.5 Z" fill="white" />
      <rect x="8" y="96" width="32" height="32" rx="8" fill="transparent" stroke="#2a2a40" strokeWidth="1.5" />
      <rect x="14" y="106" width="20" height="12" rx="2" stroke="#475569" strokeWidth="1.5" fill="none" />
      <rect x="8" y="136" width="32" height="32" rx="8" fill="transparent" stroke="#2a2a40" strokeWidth="1.5" />
      <circle cx="24" cy="152" r="9" stroke="#475569" strokeWidth="1.5" fill="none" />
      <rect x="8" y="176" width="32" height="32" rx="8" fill="transparent" stroke="#2a2a40" strokeWidth="1.5" />
      <path d="M15 192 Q24 183 33 192" stroke="#475569" strokeWidth="1.5" fill="none" />
      <rect x="8" y="216" width="32" height="32" rx="8" fill="transparent" stroke="#2a2a40" strokeWidth="1.5" />
      <path d="M16 226 L32 242 M32 226 L16 242" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── yellow sticky – top left ── */}
      <g filter="url(#cardshadow)">
        <rect x="68" y="62" width="148" height="112" rx="4" fill="#fef08a" />
        <rect x="68" y="62" width="148" height="20" rx="4" fill="#fde047" />
        <rect x="68" y="74" width="148" height="8" fill="#fde047" />
      </g>
      <text x="142" y="78" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
        💡 User Story
      </text>
      <text x="80" y="102" fill="#713f12" fontSize="10" fontFamily="system-ui, sans-serif">As a designer, I want to</text>
      <text x="80" y="118" fill="#713f12" fontSize="10" fontFamily="system-ui, sans-serif">sketch ideas and instantly</text>
      <text x="80" y="134" fill="#713f12" fontSize="10" fontFamily="system-ui, sans-serif">turn them into real UI.</text>
      <text x="80" y="158" fill="#a16207" fontSize="9" fontFamily="system-ui, sans-serif" opacity="0.8">— @design_team</text>

      {/* arrow: sticky → center */}
      <path
        d="M 216 118 C 256 118 258 185 294 193"
        stroke="#7c3aed"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#ah-purple)"
        strokeDasharray="5,3"
        opacity="0.7"
      />

      {/* ── center card — Zenith Canvas ── */}
      <g filter="url(#softshadow)">
        <rect x="294" y="155" width="186" height="90" rx="12" fill="url(#centerGrad)" stroke="#7c3aed" strokeWidth="1.5" />
      </g>
      <text x="387" y="198" textAnchor="middle" fill="#c4b5fd" fontSize="16" fontWeight="800" fontFamily="system-ui, sans-serif">
        Zenith Canvas
      </text>
      <text x="387" y="220" textAnchor="middle" fill="#7c6aad" fontSize="10" fontFamily="system-ui, sans-serif">
        Infinite whiteboard + AI
      </text>
      {/* selection handles */}
      <rect x="289" y="150" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <rect x="476" y="150" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <rect x="289" y="239" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />
      <rect x="476" y="239" width="9" height="9" rx="2.5" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1" />

      {/* arrow: center → export */}
      <path d="M 480 193 L 534 193" stroke="#3b82f6" strokeWidth="1.5" fill="none" markerEnd="url(#ah-blue)" />

      {/* ── right card – export ── */}
      <g filter="url(#cardshadow)">
        <rect x="534" y="160" width="160" height="68" rx="10" fill="#0d1526" stroke="#3b82f6" strokeWidth="1.5" />
      </g>
      <text x="614" y="192" textAnchor="middle" fill="#60a5fa" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        🚀 Export
      </text>
      <text x="614" y="210" textAnchor="middle" fill="#1d4ed8" fontSize="10" fontFamily="system-ui, sans-serif">
        PNG · SVG · Code
      </text>

      {/* arrow: center → collab */}
      <path d="M 387 245 L 387 294" stroke="#22d3ee" strokeWidth="1.5" fill="none" markerEnd="url(#ah-green)" />

      {/* ── bottom card — collab ── */}
      <g filter="url(#cardshadow)">
        <rect x="294" y="294" width="186" height="68" rx="10" fill="#060f14" stroke="#22d3ee" strokeWidth="1.5" />
      </g>
      <text x="387" y="325" textAnchor="middle" fill="#22d3ee" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        👥 Collaborate
      </text>
      <text x="387" y="343" textAnchor="middle" fill="#155e75" fontSize="10" fontFamily="system-ui, sans-serif">
        Real-time · Yjs powered
      </text>

      {/* ── pink sticky — top right ── */}
      <g filter="url(#cardshadow)">
        <rect x="592" y="64" width="148" height="88" rx="4" fill="#fce7f3" />
        <rect x="592" y="64" width="148" height="20" rx="4" fill="#f9a8d4" />
        <rect x="592" y="76" width="148" height="8" fill="#f9a8d4" />
      </g>
      <text x="666" y="80" textAnchor="middle" fill="#9d174d" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
        🤖 AI Sketch → Code
      </text>
      <text x="602" y="104" fill="#831843" fontSize="9.5" fontFamily="system-ui, sans-serif">Draw a button →</text>
      <text x="602" y="119" fill="#831843" fontSize="9.5" fontFamily="system-ui, sans-serif">get React component</text>
      <text x="602" y="134" fill="#9d174d" fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="600">✓ Gemini  ✓ Ollama</text>

      {/* arrow: pink → center */}
      <path
        d="M 592 110 C 550 110 518 168 480 190"
        stroke="#ec4899"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#ah-purple)"
        strokeDasharray="4,3"
        opacity="0.6"
      />

      {/* ── blue sticky — bottom left ── */}
      <g filter="url(#cardshadow)">
        <rect x="68" y="278" width="148" height="90" rx="4" fill="#dbeafe" />
        <rect x="68" y="278" width="148" height="20" rx="4" fill="#93c5fd" />
        <rect x="68" y="290" width="148" height="8" fill="#93c5fd" />
      </g>
      <text x="142" y="294" textAnchor="middle" fill="#1e3a8a" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
        💾 Local-First
      </text>
      <text x="78" y="316" fill="#1e40af" fontSize="9.5" fontFamily="system-ui, sans-serif">Your files live on your</text>
      <text x="78" y="331" fill="#1e40af" fontSize="9.5" fontFamily="system-ui, sans-serif">device. Zero cloud storage.</text>
      <text x="78" y="346" fill="#1e40af" fontSize="9" fontFamily="system-ui, sans-serif">No vendor lock-in. Ever.</text>
      <text x="78" y="360" fill="#2563eb" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">● Saved locally</text>

      {/* arrow: blue sticky → center */}
      <path
        d="M 216 323 C 256 323 262 245 294 218"
        stroke="#3b82f6"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#ah-blue)"
        strokeDasharray="5,3"
        opacity="0.6"
      />

      {/* ── bottom bar — collaborator avatars ── */}
      <rect x="0" y="395" width="760" height="35" fill="#0e0e1c" />
      <line x1="0" y1="395" x2="760" y2="395" stroke="#1a1a2e" strokeWidth="1" />
      {/* avatars */}
      <circle cx="64" cy="412" r="11" fill="#7c3aed" />
      <text x="64" y="416.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">A</text>
      <circle cx="85" cy="412" r="11" fill="#0891b2" />
      <text x="85" y="416.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">K</text>
      <circle cx="106" cy="412" r="11" fill="#059669" />
      <text x="106" y="416.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">S</text>
      <text x="124" y="416.5" fill="#475569" fontSize="11" fontFamily="system-ui">3 editing live</text>
      {/* zoom control */}
      <rect x="340" y="400" width="80" height="24" rx="12" fill="#13131f" stroke="#1e293b" />
      <text x="380" y="416" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="system-ui">100%</text>
      {/* save indicator */}
      <rect x="618" y="400" width="128" height="24" rx="12" fill="#0a140a" stroke="#166534" />
      <circle cx="633" cy="412" r="4.5" fill="#22c55e" />
      <text x="644" y="416" fill="#4ade80" fontSize="11" fontFamily="system-ui">Saved locally</text>
      {/* cursor */}
      <path
        d="M430 162 L430 178 L433 174 L435.5 180 L437.5 179 L435 173 L439 173 Z"
        fill="white"
        stroke="#0a0a14"
        strokeWidth="0.6"
      />
    </svg>
  );
}

/* ── feature card ── */
function FeatureCard({
  icon,
  title,
  desc,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag?: string;
}) {
  return (
    <div className="zc-feature-card">
      <div className="zc-feature-icon">{icon}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 className="zc-feature-title">{title}</h3>
        {tag && <span className="zc-feature-tag">{tag}</span>}
      </div>
      <p className="zc-feature-desc">{desc}</p>
    </div>
  );
}

/* ── step ── */
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="zc-step">
      <div className="zc-step-num">{n}</div>
      <h3 className="zc-step-title">{title}</h3>
      <p className="zc-step-desc">{desc}</p>
    </div>
  );
}

/* ── CSS ── */
const CSS = `
  .zc-page {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: #06060e;
    color: #f0f0f0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: #1e293b #06060e;
  }

  /* NAV */
  .zc-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(6,6,14,0.85);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid #111827;
  }
  .zc-nav-inner {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 28px;
    height: 62px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .zc-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #f0f0f0;
    text-decoration: none;
    flex-shrink: 0;
  }
  .zc-nav-links {
    display: flex;
    gap: 4px;
    margin-left: 12px;
    flex: 1;
  }
  .zc-nav-link {
    padding: 6px 14px;
    color: #64748b;
    font-size: 14px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    transition: color 0.15s, background 0.15s;
    font-family: inherit;
  }
  .zc-nav-link:hover { color: #cbd5e1; background: rgba(255,255,255,0.05); }
  .zc-nav-cta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .zc-btn-ghost {
    padding: 7px 16px;
    background: none;
    border: 1px solid #1e293b;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 13.5px;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, color 0.15s;
  }
  .zc-btn-ghost:hover { border-color: #334155; color: #f0f0f0; }
  .zc-btn-primary {
    padding: 7px 18px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.15s;
  }
  .zc-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

  /* HERO */
  .zc-hero {
    max-width: 1160px;
    margin: 0 auto;
    padding: 72px 28px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .zc-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 14px;
    border-radius: 100px;
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.3);
    color: #a78bfa;
    font-size: 12.5px;
    font-weight: 500;
    margin-bottom: 28px;
    letter-spacing: 0.02em;
  }
  .zc-hero-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  .zc-hero-title {
    font-size: clamp(42px, 6vw, 78px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.04em;
    margin-bottom: 22px;
    color: #f0f0f0;
    max-width: 820px;
  }
  .zc-gradient-text {
    background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 60%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .zc-hero-sub {
    font-size: clamp(16px, 2vw, 20px);
    color: #64748b;
    line-height: 1.65;
    max-width: 600px;
    margin-bottom: 36px;
  }
  .zc-hero-actions {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 64px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .zc-hero-cta {
    padding: 13px 28px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 0 0 0 rgba(124,58,237,0.4);
  }
  .zc-hero-cta:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(124,58,237,0.35);
  }
  .zc-hero-cta-ghost {
    padding: 13px 24px;
    background: none;
    border: 1px solid #1e293b;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 15px;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, color 0.15s;
  }
  .zc-hero-cta-ghost:hover { border-color: #334155; color: #f0f0f0; }
  .zc-hero-visual {
    position: relative;
    width: 100%;
    max-width: 860px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px #1a1a2e,
      0 32px 80px rgba(0,0,0,0.7),
      0 0 80px rgba(124,58,237,0.12);
  }
  .zc-hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 300px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }

  /* TRUSTED BY / STATS */
  .zc-stats {
    background: #0a0a14;
    border-top: 1px solid #111827;
    border-bottom: 1px solid #111827;
    margin-top: 80px;
  }
  .zc-stats-inner {
    max-width: 1160px;
    margin: 0 auto;
    padding: 40px 28px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 32px;
    text-align: center;
  }
  .zc-stat-num {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .zc-stat-label {
    font-size: 13px;
    color: #475569;
    margin-top: 4px;
  }

  /* FEATURES */
  .zc-features {
    max-width: 1160px;
    margin: 0 auto;
    padding: 100px 28px;
  }
  .zc-section-eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7c3aed;
    margin-bottom: 14px;
  }
  .zc-section-title {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #f0f0f0;
    margin-bottom: 16px;
    line-height: 1.15;
  }
  .zc-section-sub {
    font-size: 16px;
    color: #475569;
    max-width: 500px;
    line-height: 1.6;
    margin-bottom: 56px;
  }
  .zc-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
  .zc-feature-card {
    background: #0d0d1a;
    border: 1px solid #1a1a2e;
    border-radius: 14px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    cursor: default;
  }
  .zc-feature-card:hover {
    border-color: rgba(124,58,237,0.5);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(124,58,237,0.1);
  }
  .zc-feature-icon {
    width: 52px;
    height: 52px;
    background: rgba(124,58,237,0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(124,58,237,0.2);
  }
  .zc-feature-title {
    font-size: 16px;
    font-weight: 700;
    color: #f0f0f0;
    letter-spacing: -0.01em;
  }
  .zc-feature-tag {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: rgba(34,197,94,0.12);
    color: #22c55e;
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 100px;
    padding: 2px 8px;
  }
  .zc-feature-desc {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
  }

  /* HOW IT WORKS */
  .zc-how {
    background: #090914;
    border-top: 1px solid #111827;
    border-bottom: 1px solid #111827;
    padding: 100px 28px;
  }
  .zc-how-inner {
    max-width: 1160px;
    margin: 0 auto;
  }
  .zc-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 40px;
    margin-top: 56px;
    position: relative;
  }
  .zc-step {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .zc-step-num {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
  }
  .zc-step-title {
    font-size: 18px;
    font-weight: 700;
    color: #f0f0f0;
    letter-spacing: -0.01em;
  }
  .zc-step-desc {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
  }

  /* PRIVACY SECTION */
  .zc-privacy {
    max-width: 1160px;
    margin: 0 auto;
    padding: 100px 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  @media (max-width: 768px) {
    .zc-privacy { grid-template-columns: 1fr; gap: 40px; }
  }
  .zc-privacy-pills {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .zc-privacy-pill {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: #0d0d1a;
    border: 1px solid #1a1a2e;
    border-radius: 12px;
  }
  .zc-privacy-pill-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .zc-privacy-pill-text {
    font-size: 14px;
    color: #94a3b8;
  }

  /* BOTTOM CTA */
  .zc-cta-section {
    text-align: center;
    padding: 100px 28px;
    background: #090914;
    border-top: 1px solid #111827;
    position: relative;
    overflow: hidden;
  }
  .zc-cta-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .zc-cta-title {
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #f0f0f0;
    margin-bottom: 14px;
    position: relative;
    z-index: 1;
  }
  .zc-cta-sub {
    font-size: 16px;
    color: #475569;
    margin-bottom: 36px;
    position: relative;
    z-index: 1;
  }
  .zc-cta-btn {
    padding: 15px 36px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
    position: relative;
    z-index: 1;
    letter-spacing: -0.01em;
  }
  .zc-cta-btn:hover {
    opacity: 0.88;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(124,58,237,0.4);
  }
  .zc-cta-note {
    margin-top: 16px;
    font-size: 12.5px;
    color: #334155;
    position: relative;
    z-index: 1;
  }

  /* FOOTER */
  .zc-footer {
    background: #06060e;
    border-top: 1px solid #111827;
    padding: 40px 28px;
  }
  .zc-footer-inner {
    max-width: 1160px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .zc-footer-copy {
    font-size: 13px;
    color: #334155;
  }
  .zc-footer-links {
    display: flex;
    gap: 20px;
  }
  .zc-footer-link {
    font-size: 13px;
    color: #334155;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s;
    padding: 0;
  }
  .zc-footer-link:hover { color: #64748b; }
`;

/* ── main component ── */
export function HomePage({ onGetStarted, onLogin }: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="zc-page">

        {/* ━━ NAV ━━ */}
        <nav className="zc-nav">
          <div className="zc-nav-inner">
            <span className="zc-logo">
              <IconStar />
              Zenith Canvas
            </span>
            <div className="zc-nav-links">
              <button
                className="zc-nav-link"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Features
              </button>
              <button
                className="zc-nav-link"
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
              >
                How it works
              </button>
              <button
                className="zc-nav-link"
                onClick={() => document.getElementById("privacy")?.scrollIntoView({ behavior: "smooth" })}
              >
                Privacy
              </button>
            </div>
            <div className="zc-nav-cta">
              <button className="zc-btn-ghost" onClick={onLogin}>Log in</button>
              <button className="zc-btn-primary" onClick={onGetStarted}>Get started free →</button>
            </div>
          </div>
        </nav>

        {/* ━━ HERO ━━ */}
        <section className="zc-hero">
          <div className="zc-hero-badge">
            <span className="zc-hero-badge-dot" />
            Now in beta &nbsp;·&nbsp; Free forever
          </div>
          <h1 className="zc-hero-title">
            Draw. Collaborate.{" "}
            <span className="zc-gradient-text">Ship.</span>
          </h1>
          <p className="zc-hero-sub">
            The infinite whiteboard for teams who move fast. Sketch ideas, build diagrams, and turn
            your drawings into working code — all from one place. Your files never leave your device.
          </p>
          <div className="zc-hero-actions">
            <button className="zc-hero-cta" onClick={onGetStarted}>
              Start drawing free →
            </button>
            <button
              className="zc-hero-cta-ghost"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              See what&apos;s inside
            </button>
          </div>
          <div className="zc-hero-visual">
            <CanvasMockup />
          </div>
        </section>

        {/* ━━ STATS STRIP ━━ */}
        <div className="zc-stats">
          <div className="zc-stats-inner">
            <div>
              <div className="zc-stat-num">∞</div>
              <div className="zc-stat-label">Canvas size</div>
            </div>
            <div>
              <div className="zc-stat-num">0 ms</div>
              <div className="zc-stat-label">Network lag (local-first)</div>
            </div>
            <div>
              <div className="zc-stat-num">0 GB</div>
              <div className="zc-stat-label">Cloud storage used</div>
            </div>
            <div>
              <div className="zc-stat-num">100%</div>
              <div className="zc-stat-label">Your data, your device</div>
            </div>
          </div>
        </div>

        {/* ━━ FEATURES ━━ */}
        <section id="features" className="zc-features">
          <div className="zc-section-eyebrow">Everything you need</div>
          <h2 className="zc-section-title">Built for how you actually work</h2>
          <p className="zc-section-sub">
            No bloat, no paywalls, no surveillance. Just a fast, private canvas with the features
            that matter.
          </p>
          <div className="zc-features-grid">
            <FeatureCard
              icon={<IconCanvas />}
              title="Infinite Canvas"
              desc="Pan, zoom, and draw without limits. Sticky notes, shapes, connectors, freehand — every tool you need for visual thinking."
            />
            <FeatureCard
              icon={<IconLock />}
              title="Local-First Storage"
              tag="Privacy"
              desc="Your drawings auto-save to your browser and export directly to your drive as .tldr files. Zero cloud, zero subscriptions."
            />
            <FeatureCard
              icon={<IconBolt />}
              title="Real-Time Collaboration"
              desc="Invite teammates and work together live. Every cursor, every shape — synced instantly over your own server with Yjs."
            />
            <FeatureCard
              icon={<IconAI />}
              title="AI Sketch → Code"
              tag="Beta"
              desc="Rough out a UI on the canvas, hit one button, and get production-ready React or HTML back. Powered by Gemini or local Ollama."
            />
            <FeatureCard
              icon={<IconExport />}
              title="Export Anywhere"
              desc="Save as .tldr, export to PNG or SVG, or copy shapes as code. Your work is always portable."
            />
            <FeatureCard
              icon={<IconBolt />}
              title="Self-Hostable"
              desc="Run the entire stack on your own infrastructure. Full Fastify server with PostgreSQL, Hocuspocus, and Socket.io included."
            />
          </div>
        </section>

        {/* ━━ HOW IT WORKS ━━ */}
        <section id="how" className="zc-how">
          <div className="zc-how-inner">
            <div className="zc-section-eyebrow">Simple by design</div>
            <h2 className="zc-section-title">Up and running in seconds</h2>
            <div className="zc-steps">
              <Step
                n={1}
                title="Create your account"
                desc="Sign up with an email — no credit card, no trial period. Your account is yours to keep."
              />
              <Step
                n={2}
                title="Open your canvas"
                desc="A blank infinite whiteboard is ready the moment you log in. Start with a sticky note or a diagram."
              />
              <Step
                n={3}
                title="Save to your drive"
                desc='Hit "Save to file" and pick where the .tldr file lives. Your machine, your folder, your rules.'
              />
              <Step
                n={4}
                title="Invite your team"
                desc="Share a link and collaborate in real time. Everyone's edits sync live — no refresh needed."
              />
            </div>
          </div>
        </section>

        {/* ━━ PRIVACY SECTION ━━ */}
        <section id="privacy">
          <div className="zc-privacy">
            <div>
              <div className="zc-section-eyebrow">Privacy first</div>
              <h2 className="zc-section-title">
                Your canvas.{" "}
                <span className="zc-gradient-text">Your rules.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.65, marginTop: 16 }}>
                Most whiteboards store your designs on their servers, sell analytics, and lock you
                into subscriptions. Zenith Canvas works the other way around — your drawing data
                lives on your device by default, and you choose if and when to sync.
              </p>
            </div>
            <div className="zc-privacy-pills">
              {[
                { color: "#22c55e", text: "Drawings auto-save to your browser's localStorage" },
                { color: "#22c55e", text: "Export to .tldr files on your own drive — offline capable" },
                { color: "#22c55e", text: "Server stores only your account and document title" },
                { color: "#22c55e", text: "Real-time sync goes through your own Hocuspocus instance" },
                { color: "#22c55e", text: "AI processing optional — use local Ollama for 100% private" },
                { color: "#22c55e", text: "Open source — self-host the entire stack" },
              ].map((item) => (
                <div className="zc-privacy-pill" key={item.text}>
                  <span
                    className="zc-privacy-pill-dot"
                    style={{ background: item.color }}
                  />
                  <span className="zc-privacy-pill-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ BOTTOM CTA ━━ */}
        <section className="zc-cta-section">
          <div className="zc-cta-glow" />
          <h2 className="zc-cta-title">
            The whiteboard that{" "}
            <span className="zc-gradient-text">respects you.</span>
          </h2>
          <p className="zc-cta-sub">
            No storage limits. No subscriptions. No tracking. Just your ideas on an infinite canvas.
          </p>
          <button className="zc-cta-btn" onClick={onGetStarted}>
            Start drawing for free →
          </button>
          <p className="zc-cta-note">No credit card required. Free forever.</p>
        </section>

        {/* ━━ FOOTER ━━ */}
        <footer className="zc-footer">
          <div className="zc-footer-inner">
            <span className="zc-logo" style={{ fontSize: 14 }}>
              <IconStar />
              Zenith Canvas
            </span>
            <span className="zc-footer-copy">© 2026 Zenith Canvas. Your canvas, your rules.</span>
            <div className="zc-footer-links">
              <button className="zc-footer-link" onClick={onGetStarted}>Get started</button>
              <button className="zc-footer-link" onClick={onLogin}>Log in</button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
