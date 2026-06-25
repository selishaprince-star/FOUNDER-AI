import { useState, useEffect, useRef } from "react";

// ─── Design tokens ───────────────────────────────────────────────────────────
// Palette: deep navy #0F1629, electric indigo #4F46E5, vivid violet #7C3AED,
//          soft lavender #EEF2FF, off-white #F8FAFC, warm slate #94A3B8
// Type: display = "Space Grotesk", body = "Inter"
// Signature: animated "match pulse" ring on co-founder cards

const COLORS = {
  navy: "#0F1629",
  indigo: "#4F46E5",
  violet: "#7C3AED",
  lavender: "#EEF2FF",
  white: "#F8FAFC",
  slate: "#94A3B8",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  darkCard: "#1E2A45",
};

// ─── Inline styles helper ────────────────────────────────────────────────────
const s = (obj) => obj;

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_FOUNDERS = [
  { id: 1, name: "Arjun Mehta", role: "Full-Stack Developer", location: "Bangalore", skills: ["React", "Node.js", "Python"], interests: ["FinTech", "AI"], score: 94, avatar: "AM", exp: "4 years", availability: "Full-time" },
  { id: 2, name: "Priya Sharma", role: "AI Engineer", location: "Mumbai", skills: ["Python", "TensorFlow", "LLMs"], interests: ["Healthcare", "AI"], score: 91, avatar: "PS", exp: "3 years", availability: "Full-time" },
  { id: 3, name: "Rahul Gupta", role: "Business Analyst", location: "Delhi", skills: ["Finance", "Marketing", "Strategy"], interests: ["FinTech", "Education"], score: 87, avatar: "RG", exp: "5 years", availability: "Part-time" },
  { id: 4, name: "Sneha Rao", role: "UI/UX Designer", location: "Hyderabad", skills: ["Figma", "Adobe XD", "CSS"], interests: ["EdTech", "Healthcare"], score: 85, avatar: "SR", exp: "3 years", availability: "Full-time" },
  { id: 5, name: "Vikram Nair", role: "Marketing Expert", location: "Chennai", skills: ["SEO", "Growth", "Branding"], interests: ["Agriculture", "IoT"], score: 82, avatar: "VN", exp: "6 years", availability: "Full-time" },
  { id: 6, name: "Ananya Patel", role: "Developer", location: "Pune", skills: ["Java", "Spring Boot", "MySQL"], interests: ["Cybersecurity", "FinTech"], score: 79, avatar: "AP", exp: "2 years", availability: "Full-time" },
];

const MOCK_STARTUPS = [
  { id: 1, name: "MediSync", domain: "Healthcare", problem: "Fragmented patient records across hospitals", team: 2, needed: ["Developer", "Designer"], stage: "Idea", owner: "Priya S." },
  { id: 2, name: "AgriBot", domain: "Agriculture", problem: "Small farmers lack access to precision farming", team: 3, needed: ["AI Engineer", "Marketer"], stage: "MVP", owner: "Vikram N." },
  { id: 3, name: "EduChain", domain: "Education", problem: "Certificate verification is slow and fraud-prone", team: 1, needed: ["Developer", "Business Analyst", "Designer"], stage: "Idea", owner: "Rahul G." },
  { id: 4, name: "FinGuard", domain: "FinTech", problem: "SMEs struggle with real-time financial monitoring", team: 2, needed: ["Developer", "Marketing Expert"], stage: "Growth", owner: "Arjun M." },
  { id: 5, name: "SecureNet", domain: "Cybersecurity", problem: "SMBs cannot afford enterprise security tools", team: 2, needed: ["AI Engineer", "Designer"], stage: "MVP", owner: "Ananya P." },
];

const MOCK_MENTORS = [
  { id: 1, name: "Dr. Rajesh Kumar", expertise: "AI & Deep Tech", exp: "18 years", company: "IIT Delhi", avatar: "RK", rating: 4.9, sessions: 240, domains: ["AI", "IoT", "Cybersecurity"] },
  { id: 2, name: "Meera Nair", expertise: "Growth & Marketing", exp: "12 years", company: "Former CMO, Swiggy", avatar: "MN", rating: 4.8, sessions: 180, domains: ["Marketing", "Fundraising", "Business"] },
  { id: 3, name: "Suresh Pillai", expertise: "FinTech & Blockchain", exp: "15 years", company: "HDFC Ventures", avatar: "SP", rating: 4.7, sessions: 150, domains: ["FinTech", "Business", "Fundraising"] },
  { id: 4, name: "Kavita Joshi", expertise: "Product & UX Strategy", exp: "10 years", company: "Ex-Microsoft", avatar: "KJ", rating: 4.9, sessions: 200, domains: ["Technology", "Business"] },
];

const MOCK_INVESTORS = [
  { id: 1, name: "Anil Kapoor", org: "Sequoia India", interest: "AI, FinTech", stage: "Seed to Series A", avatar: "AK", portfolio: 32 },
  { id: 2, name: "Divya Menon", org: "Blume Ventures", interest: "EdTech, Healthcare", stage: "Pre-seed to Seed", avatar: "DM", portfolio: 28 },
  { id: 3, name: "Rajan Tiwari", org: "Accel Partners", interest: "SaaS, Cybersecurity", stage: "Series A+", avatar: "RT", portfolio: 45 },
];

// ─── Reusable Components ─────────────────────────────────────────────────────
function Avatar({ initials, size = 44, color = COLORS.indigo }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${COLORS.violet})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ label, color = COLORS.indigo }) {
  return (
    <span style={{ background: color + "20", color, border: `1px solid ${color}40`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", style: extra = {}, disabled = false }) {
  const base = { borderRadius: 10, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "all 0.2s", outline: "none", opacity: disabled ? 0.6 : 1 };
  const sizes = { sm: { padding: "6px 16px", fontSize: 13 }, md: { padding: "10px 22px", fontSize: 15 }, lg: { padding: "14px 32px", fontSize: 17 } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`, color: "#fff", boxShadow: "0 4px 15px rgba(79,70,229,0.4)" },
    secondary: { background: "transparent", color: COLORS.indigo, border: `2px solid ${COLORS.indigo}` },
    ghost: { background: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(8px)" },
    danger: { background: COLORS.red, color: "#fff" },
    success: { background: COLORS.green, color: "#fff" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>{children}</button>;
}

function Card({ children, style: extra = {}, glass = false }) {
  return (
    <div style={{ background: glass ? "rgba(255,255,255,0.05)" : "#fff", borderRadius: 16, padding: 24, boxShadow: glass ? "0 8px 32px rgba(0,0,0,0.3)" : "0 2px 16px rgba(15,22,41,0.08)", border: glass ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0", ...extra }}>
      {children}
    </div>
  );
}

function ScoreRing({ score, size = 60 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 85 ? COLORS.green : score >= 70 ? COLORS.amber : COLORS.red;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: size * 0.25, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{score}%</span>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, icon, style: extra = {} }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Inter', sans-serif" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", padding: icon ? "10px 12px 10px 38px" : "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff", color: "#111827", ...extra }} />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Inter', sans-serif" }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", background: "#fff", color: "#111827" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: COLORS.indigo, color: "#fff", padding: "14px 22px", borderRadius: 12, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: "0 8px 32px rgba(79,70,229,0.4)", display: "flex", alignItems: "center", gap: 10 }}>
      ✅ {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, marginLeft: 8 }}>×</button>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,22,41,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", color: COLORS.navy, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6B7280" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── API Client (talks to the FoundrAI Express + SQLite backend) ────────────
const API_URL = (typeof window !== "undefined" && window.FOUNDRAI_API_URL) || "http://localhost:4000/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("foundrai_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(auth ? authHeaders() : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// ─── AI Hook ─────────────────────────────────────────────────────────────────
// Routes through the backend's template-based /api/ai/* endpoints, so the
// Evaluator/Pitch/Match-explanation pages work with zero API keys configured.
// Swap the backend handlers for real Anthropic calls server-side if you want.
async function callClaude(prompt, systemPrompt = "", endpoint = null, body = null) {
  try {
    if (endpoint) {
      const data = await api(endpoint, { method: "POST", body });
      return data.text || "No response generated.";
    }
    return "No response generated.";
  } catch (err) {
    return "⚠️ AI service unavailable right now. Make sure the backend is running on " + API_URL + ".";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LANDING PAGE ────────────────────────────────────────────────────────────
function LandingPage({ navigate, setUser }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regData, setRegData] = useState({ name: "", email: "", password: "", role: "Developer", location: "" });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [toast, setToast] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [pendingNav, setPendingNav] = useState(null); // page to go to once logged in

  // Any nav item / CTA that needs an account routes through here instead of
  // silently failing when there's no logged-in user yet.
  function goOrLogin(targetPage) {
    setPendingNav(targetPage);
    setShowLogin(true);
  }

  const SKILLS_LIST = ["Java", "Spring Boot", "React", "Python", "AI/ML", "UI/UX", "Marketing", "Finance", "Node.js", "TensorFlow"];
  const INTERESTS_LIST = ["Healthcare", "Education", "Agriculture", "FinTech", "AI", "IoT", "Cybersecurity", "EdTech"];

  const toggleArr = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);

  async function handleLogin() {
    if (!loginEmail || !loginPass) { setToast("Please fill all fields"); return; }
    setAuthBusy(true);
    try {
      const { token, user } = await api("/auth/login", { method: "POST", body: { email: loginEmail, password: loginPass } });
      localStorage.setItem("foundrai_token", token);
      setUser(user);
      setShowLogin(false);
      navigate(pendingNav || "dashboard");
      setPendingNav(null);
    } catch (err) {
      setToast(err.message || "Login failed");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleRegister() {
    if (!regData.name || !regData.email || !regData.password) { setToast("Please fill all required fields"); return; }
    setAuthBusy(true);
    try {
      const { token, user } = await api("/auth/register", {
        method: "POST",
        body: { ...regData, skills: selectedSkills, interests: selectedInterests },
      });
      localStorage.setItem("foundrai_token", token);
      setUser(user);
      setShowRegister(false);
      navigate(pendingNav || "dashboard");
      setPendingNav(null);
    } catch (err) {
      setToast(err.message || "Registration failed");
    } finally {
      setAuthBusy(false);
    }
  }

  const stats = [
    { num: "10,000+", label: "Founders", icon: "👥" },
    { num: "3,000+", label: "Startup Ideas", icon: "💡" },
    { num: "1,500+", label: "Teams Formed", icon: "🚀" },
    { num: "500+", label: "Mentors", icon: "🎓" },
  ];

  const steps = [
    { step: "01", title: "Create Profile", desc: "Build your founder DNA profile with skills, interests & personality", icon: "👤" },
    { step: "02", title: "Get AI Matches", desc: "Our AI analyzes 50+ parameters to find your perfect co-founder", icon: "🤖" },
    { step: "03", title: "Form Your Team", desc: "Connect, chat, and collaborate with matched founders", icon: "🤝" },
    { step: "04", title: "Build Startup", desc: "Use our workspace tools to develop your product", icon: "🛠️" },
    { step: "05", title: "Get Funding", desc: "Showcase your startup to 500+ investors on our platform", icon: "💰" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.white, minHeight: "100vh" }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(79,70,229,0.15) !important; }
        .pulse-ring { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,0.4)} 50%{box-shadow:0 0 0 12px rgba(79,70,229,0)} }
        .hover-lift:hover { transform: translateY(-2px); }
        .nav-link:hover { color: ${COLORS.indigo} !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: "rgba(15,22,41,0.95)", backdropFilter: "blur(20px)", padding: "0 40px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("landing")}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: -0.5 }}>Foundr<span style={{ color: COLORS.indigo }}>AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Explore Startups", "Find Co-Founder", "Mentors", "Investors"].map(item => {
            const target = item === "Explore Startups" ? "startups" : item === "Find Co-Founder" ? "matching" : item.toLowerCase();
            return (
              <span key={item} className="nav-link" onClick={() => goOrLogin(target)}
                style={{ color: "#CBD5E1", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}>{item}</span>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="ghost" onClick={() => setShowLogin(true)} size="sm">Login</Button>
          <Button onClick={() => setShowRegister(true)} size="sm">Register</Button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a1060 50%, #0d1f3c 100%)`, padding: "100px 40px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(79,70,229,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.12) 0%, transparent 40%)" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,70,229,0.2)", border: "1px solid rgba(79,70,229,0.4)", borderRadius: 20, padding: "6px 16px", marginBottom: 28 }}>
            <span style={{ fontSize: 12 }}>✨</span>
            <span style={{ color: "#A5B4FC", fontSize: 13, fontWeight: 500 }}>AI-Powered Co-Founder Matching</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 62, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 20, letterSpacing: -2 }}>
            Find the Perfect<br /><span style={{ background: "linear-gradient(90deg, #818CF8, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Co-Founder</span><br />for Your Startup
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 19, marginBottom: 40, lineHeight: 1.7 }}>AI-powered founder matching platform for innovators and entrepreneurs.<br />Build your dream team in days, not months.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Button onClick={() => goOrLogin("matching")} size="lg" style={{ fontSize: 16 }}>🔍 Find Co-Founder</Button>
            <Button onClick={() => goOrLogin("startups")} variant="ghost" size="lg" style={{ fontSize: 16 }}>💡 Post Startup Idea</Button>
          </div>
        </div>
        {/* Floating cards */}
        <div style={{ position: "absolute", left: 40, top: "30%", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", textAlign: "left", display: "none" }} className="hero-float">
          <div style={{ color: "#A5B4FC", fontSize: 12, marginBottom: 6 }}>Match Found ✓</div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>94% compatibility</div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#fff", padding: "48px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "24px 16px", borderRadius: 16, background: COLORS.lavender, border: `1px solid rgba(79,70,229,0.1)` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 800, color: COLORS.navy }}>{s.num}</div>
              <div style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: COLORS.white, padding: "64px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: COLORS.indigo, fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>PROCESS</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, color: COLORS.navy }}>How FoundrAI Works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}>
            {steps.map((s, i) => (
              <div key={s.step} className="hover-card" style={{ textAlign: "center", padding: 24, borderRadius: 16, background: "#fff", border: "1px solid #E2E8F0", transition: "all 0.3s", position: "relative" }}>
                {i < steps.length - 1 && <div style={{ position: "absolute", top: 40, right: -10, width: 20, height: 2, background: "#E2E8F0", zIndex: 1 }} />}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: COLORS.indigo, letterSpacing: 1, marginBottom: 6 }}>{s.step}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.navy, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: "#6B7280", fontSize: 12, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED STARTUPS */}
      <section style={{ background: COLORS.lavender, padding: "64px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <p style={{ color: COLORS.indigo, fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>TRENDING</p>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: COLORS.navy }}>Featured Startup Ideas</h2>
            </div>
            <Button onClick={() => goOrLogin("startups")} variant="secondary">View All →</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {MOCK_STARTUPS.slice(0, 3).map(st => (
              <div key={st.id} className="hover-card" style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", transition: "all 0.3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>{st.name}</div>
                  <Badge label={st.domain} />
                </div>
                <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{st.problem}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>👥 {st.team} member{st.team > 1 ? "s" : ""} · needs {st.needed.length} more</span>
                  <Button size="sm" onClick={() => goOrLogin("startups")}>View →</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${COLORS.navy}, #1a1060)`, padding: "64px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Ready to Find Your Co-Founder?</h2>
        <p style={{ color: "#94A3B8", fontSize: 17, marginBottom: 32 }}>Join 10,000+ founders who found their perfect startup partner on FoundrAI</p>
        <Button onClick={() => setShowRegister(true)} size="lg">Get Started Free →</Button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: COLORS.navy, padding: "32px 40px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>Foundr<span style={{ color: COLORS.indigo }}>AI</span></div>
        <p>© 2026 FoundrAI. Building the future of entrepreneurship.</p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <Modal title="Welcome Back 👋" onClose={() => setShowLogin(false)}>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 20 }}>Sign in to your FoundrAI account</p>
          <Input label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" icon="📧" />
          <Input label="Password" type="password" value={loginPass} onChange={setLoginPass} placeholder="••••••••" icon="🔒" />
          <Button onClick={handleLogin} style={{ width: "100%" }}>Sign In</Button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span style={{ color: "#6B7280", fontSize: 13 }}>Don't have an account? </span>
            <span style={{ color: COLORS.indigo, fontWeight: 600, cursor: "pointer", fontSize: 13 }} onClick={() => { setShowLogin(false); setShowRegister(true); }}>Register</span>
          </div>
        </Modal>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <Modal title="Join FoundrAI 🚀" onClose={() => setShowRegister(false)}>
          <Input label="Full Name *" value={regData.name} onChange={v => setRegData(p => ({ ...p, name: v }))} placeholder="Your name" icon="👤" />
          <Input label="Email *" type="email" value={regData.email} onChange={v => setRegData(p => ({ ...p, email: v }))} placeholder="you@example.com" icon="📧" />
          <Input label="Password *" type="password" value={regData.password} onChange={v => setRegData(p => ({ ...p, password: v }))} placeholder="Create a strong password" icon="🔒" />
          <Input label="Location" value={regData.location} onChange={v => setRegData(p => ({ ...p, location: v }))} placeholder="City, Country" icon="📍" />
          <Select label="Your Role" value={regData.role} onChange={v => setRegData(p => ({ ...p, role: v }))}
            options={["Developer", "Designer", "Business Analyst", "Marketing Expert", "AI Engineer", "Investor", "Mentor"].map(r => ({ value: r, label: r }))} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#374151" }}>Skills</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SKILLS_LIST.map(sk => (
                <span key={sk} onClick={() => toggleArr(selectedSkills, setSelectedSkills, sk)}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", background: selectedSkills.includes(sk) ? COLORS.indigo : "#F3F4F6", color: selectedSkills.includes(sk) ? "#fff" : "#374151", transition: "all 0.2s" }}>{sk}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#374151" }}>Startup Interests</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {INTERESTS_LIST.map(int => (
                <span key={int} onClick={() => toggleArr(selectedInterests, setSelectedInterests, int)}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", background: selectedInterests.includes(int) ? COLORS.violet : "#F3F4F6", color: selectedInterests.includes(int) ? "#fff" : "#374151", transition: "all 0.2s" }}>{int}</span>
              ))}
            </div>
          </div>
          <Button onClick={handleRegister} style={{ width: "100%" }}>Create Account 🚀</Button>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ user, navigate }) {
  const [connections, setConnections] = useState([]);
  const [appliedStartups, setAppliedStartups] = useState([]);
  const [toast, setToast] = useState("");
  const [founders, setFounders] = useState(MOCK_FOUNDERS);
  const [startups, setStartups] = useState(MOCK_STARTUPS);

  useEffect(() => {
    api("/founders").then(setFounders).catch(() => {});
    api("/startups").then(setStartups).catch(() => {});
  }, []);

  const activities = [
    { icon: "🤝", text: "New match: Arjun Mehta (94%)", time: "2 min ago" },
    { icon: "💡", text: "Priya S. invited you to MediSync", time: "1 hr ago" },
    { icon: "📩", text: "New message from Rahul Gupta", time: "3 hr ago" },
    { icon: "🎉", text: "Your profile viewed 12 times today", time: "Today" },
  ];

  function handleConnect(founder) {
    if (!connections.includes(founder.id)) {
      setConnections(p => [...p, founder.id]);
      setToast(`Connection request sent to ${founder.name}!`);
      api(`/founders/${founder.id}/connect`, { method: "POST", auth: true }).catch(() => {});
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.navy }}>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p style={{ color: "#6B7280", fontSize: 15, marginTop: 4 }}>Here's what's happening with your founder journey</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Profile Completion", val: "78%", icon: "📊", color: COLORS.indigo },
          { label: "Total Matches", val: "24", icon: "🤝", color: COLORS.green },
          { label: "Applications", val: appliedStartups.length.toString(), icon: "📋", color: COLORS.amber },
          { label: "Active Teams", val: "1", icon: "🚀", color: COLORS.violet },
        ].map(s => (
          <Card key={s.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.navy }}>{s.val}</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Co-Founder Recommendations */}
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.navy, marginBottom: 16 }}>Recommended Co-Founders</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {founders.slice(0, 4).map(f => (
              <Card key={f.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                <div style={{ position: "relative" }}>
                  <Avatar initials={f.avatar} size={48} />
                  {connections.includes(f.id) && <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: COLORS.green, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>✓</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 15 }}>{f.name}</div>
                  <div style={{ color: "#6B7280", fontSize: 12 }}>{f.role} · {f.location}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {f.skills.slice(0, 3).map(sk => <Badge key={sk} label={sk} />)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <ScoreRing score={f.score} size={50} />
                  <Button size="sm" onClick={() => handleConnect(f)} variant={connections.includes(f.id) ? "success" : "primary"}>
                    {connections.includes(f.id) ? "✓ Sent" : "Connect"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="secondary" onClick={() => navigate("matching")} style={{ marginTop: 12, width: "100%" }}>View All Matches →</Button>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Recent Activity */}
          <Card>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 14 }}>Recent Activity</h3>
            {activities.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* Startup Ideas */}
          <Card>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 14 }}>Startup Opportunities</h3>
            {startups.slice(0, 3).map(st => (
              <div key={st.id} style={{ padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.navy }}>{st.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{st.domain}</div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => { setAppliedStartups(p => p.includes(st.id) ? p : [...p, st.id]); setToast(`Applied to ${st.name}!`); }}>
                    {appliedStartups.includes(st.id) ? "Applied ✓" : "Apply"}
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" style={{ marginTop: 10, width: "100%", background: COLORS.lavender, color: COLORS.indigo }} onClick={() => navigate("startups")}>Browse All Ideas →</Button>
          </Card>

          {/* Profile Completion */}
          <Card style={{ background: `linear-gradient(135deg, ${COLORS.navy}, #1a1060)` }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Complete Your Profile</h3>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 8, marginBottom: 8 }}>
              <div style={{ width: "78%", height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.violet})` }} />
            </div>
            <div style={{ color: "#A5B4FC", fontSize: 12, marginBottom: 14 }}>78% complete · Add portfolio to reach 95%</div>
            <Button variant="ghost" size="sm" onClick={() => navigate("profile")}>Complete Profile →</Button>
          </Card>
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── AI MATCHING ──────────────────────────────────────────────────────────────
function MatchingPage({ user, navigate }) {
  const [filters, setFilters] = useState({ role: "", skills: "", location: "", domain: "" });
  const [founders, setFounders] = useState(MOCK_FOUNDERS);
  const [connected, setConnected] = useState([]);
  const [aiExplain, setAiExplain] = useState({});
  const [loadingAI, setLoadingAI] = useState({});
  const [toast, setToast] = useState("");
  const [selectedFounder, setSelectedFounder] = useState(null);

  useEffect(() => {
    api("/match", { method: "POST", body: { skills: user?.skills || [], interests: user?.interests || [] } })
      .then(setFounders)
      .catch(() => api("/founders").then(setFounders).catch(() => {}));
  }, []);

  async function applyFilters() {
    try {
      const qs = new URLSearchParams();
      if (filters.role) qs.set("role", filters.role);
      if (filters.location) qs.set("location", filters.location);
      if (filters.domain) qs.set("domain", filters.domain);
      if (filters.skills) qs.set("skills", filters.skills);
      const data = await api(`/founders?${qs.toString()}`);
      setFounders(data);
    } catch {
      let f = [...MOCK_FOUNDERS];
      if (filters.role) f = f.filter(x => x.role.toLowerCase().includes(filters.role.toLowerCase()));
      if (filters.location) f = f.filter(x => x.location.toLowerCase().includes(filters.location.toLowerCase()));
      if (filters.domain) f = f.filter(x => x.interests.some(i => i.toLowerCase().includes(filters.domain.toLowerCase())));
      setFounders(f);
    }
  }

  async function getAIExplanation(founder) {
    setLoadingAI(p => ({ ...p, [founder.id]: true }));
    const result = await callClaude(null, null, "/ai/match-explanation", { founder, user });
    setAiExplain(p => ({ ...p, [founder.id]: result }));
    setLoadingAI(p => ({ ...p, [founder.id]: false }));
  }

  function handleConnect(founder) {
    if (!connected.includes(founder.id)) {
      setConnected(p => [...p, founder.id]);
      setToast(`Connection request sent to ${founder.name}!`);
      api(`/founders/${founder.id}/connect`, { method: "POST", auth: true }).catch(() => {});
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.navy, marginBottom: 6 }}>AI Co-Founder Matching</h1>
      <p style={{ color: "#6B7280", marginBottom: 28 }}>Discover founders with complementary skills and shared vision</p>

      {/* Filters */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 12, alignItems: "flex-end" }}>
          <Input label="Role" value={filters.role} onChange={v => setFilters(p => ({ ...p, role: v }))} placeholder="Developer, Designer..." />
          <Input label="Location" value={filters.location} onChange={v => setFilters(p => ({ ...p, location: v }))} placeholder="City..." icon="📍" />
          <Input label="Domain Interest" value={filters.domain} onChange={v => setFilters(p => ({ ...p, domain: v }))} placeholder="AI, FinTech..." />
          <Input label="Skills" value={filters.skills} onChange={v => setFilters(p => ({ ...p, skills: v }))} placeholder="React, Python..." />
          <Button onClick={applyFilters} style={{ marginBottom: 0, height: 42 }}>Search</Button>
        </div>
      </Card>

      {/* Results */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {founders.map(f => (
          <Card key={f.id} style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.violet})` }} />
            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
              <div style={{ position: "relative" }}>
                <div className="pulse-ring" style={{ borderRadius: "50%" }}>
                  <Avatar initials={f.avatar} size={56} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.navy }}>{f.name}</div>
                <div style={{ color: "#6B7280", fontSize: 13 }}>{f.role}</div>
                <div style={{ color: "#9CA3AF", fontSize: 12 }}>{f.location} · {f.exp} experience</div>
              </div>
              <ScoreRing score={f.score} size={56} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {f.skills.map(sk => <Badge key={sk} label={sk} />)}
              {f.interests.map(int => <Badge key={int} label={int} color={COLORS.violet} />)}
            </div>
            <div style={{ background: COLORS.lavender, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.indigo, marginBottom: 4 }}>🤖 Why this match?</div>
              {aiExplain[f.id] ? (
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>{aiExplain[f.id]}</div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => getAIExplanation(f)} disabled={loadingAI[f.id]} style={{ fontSize: 12 }}>
                  {loadingAI[f.id] ? "Analyzing..." : "Get AI Explanation"}
                </Button>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button size="sm" variant="secondary" onClick={() => setSelectedFounder(f)} style={{ flex: 1 }}>View Profile</Button>
              <Button size="sm" onClick={() => handleConnect(f)} variant={connected.includes(f.id) ? "success" : "primary"} style={{ flex: 1 }}>
                {connected.includes(f.id) ? "✓ Connected" : "Connect"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Founder Profile Modal */}
      {selectedFounder && (
        <Modal title={selectedFounder.name} onClose={() => setSelectedFounder(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <Avatar initials={selectedFounder.avatar} size={64} />
            <div>
              <div style={{ fontSize: 15, color: "#6B7280" }}>{selectedFounder.role}</div>
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>{selectedFounder.location} · {selectedFounder.exp}</div>
              <div style={{ marginTop: 6 }}><Badge label={`${selectedFounder.availability}`} color={COLORS.green} /></div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{selectedFounder.skills.map(s => <Badge key={s} label={s} />)}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>Startup Interests</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{selectedFounder.interests.map(i => <Badge key={i} label={i} color={COLORS.violet} />)}</div>
          </div>
          <div style={{ background: COLORS.lavender, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[["Match Score", `${selectedFounder.score}%`], ["Experience", selectedFounder.exp], ["Availability", selectedFounder.availability], ["Location", selectedFounder.location]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11, color: "#9CA3AF" }}>{k}</div><div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 14 }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => { handleConnect(selectedFounder); setSelectedFounder(null); }} style={{ flex: 1 }}>Send Connection Request</Button>
            <Button variant="secondary" onClick={() => setSelectedFounder(null)} style={{ flex: 1 }}>Close</Button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── STARTUPS MARKETPLACE ────────────────────────────────────────────────────
function StartupsPage({ navigate }) {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [applied, setApplied] = useState([]);
  const [toast, setToast] = useState("");
  const [newStartup, setNewStartup] = useState({ name: "", problem: "", solution: "", domain: "AI", audience: "", revenue: "", devsNeeded: "1", designersNeeded: "1" });
  const [allStartups, setAllStartups] = useState(MOCK_STARTUPS);
  const [selected, setSelected] = useState(null);

  useEffect(() => { api("/startups").then(setAllStartups).catch(() => {}); }, []);

  const filtered = allStartups.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)) && (!domain || s.domain === domain);
  });

  async function createStartup() {
    if (!newStartup.name) { setToast("Please enter a startup name"); return; }
    try {
      const created = await api("/startups", {
        method: "POST", auth: true,
        body: { name: newStartup.name, domain: newStartup.domain, problem: newStartup.problem || "Problem TBD", needed: ["Developer", "Designer"].slice(0, parseInt(newStartup.devsNeeded) || 1) },
      });
      setAllStartups(p => [created, ...p]);
    } catch {
      const ns = { id: Date.now(), name: newStartup.name, domain: newStartup.domain, problem: newStartup.problem || "Problem TBD", team: 1, needed: ["Developer", "Designer"].slice(0, parseInt(newStartup.devsNeeded)), stage: "Idea", owner: "You" };
      setAllStartups(p => [ns, ...p]);
    }
    setShowCreate(false);
    setToast(`${newStartup.name} created successfully!`);
    setNewStartup({ name: "", problem: "", solution: "", domain: "AI", audience: "", revenue: "", devsNeeded: "1", designersNeeded: "1" });
  }

  function applyToStartup(st) {
    setApplied(p => p.includes(st.id) ? p : [...p, st.id]);
    setToast(`Applied to ${st.name}!`);
    api(`/startups/${st.id}/apply`, { method: "POST", auth: true }).catch(() => {});
  }

  const domains = ["All", ...new Set(MOCK_STARTUPS.map(s => s.domain))];
  const domainColors = { Healthcare: "#EF4444", Agriculture: "#10B981", Education: "#F59E0B", FinTech: "#3B82F6", Cybersecurity: "#8B5CF6", AI: "#4F46E5" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.navy }}>Startup Ideas Marketplace</h1>
          <p style={{ color: "#6B7280", marginTop: 4 }}>Discover and join exciting startups or launch your own</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Launch Startup</Button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search startups..."
            style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>
        {domains.map(d => (
          <span key={d} onClick={() => setDomain(d === "All" ? "" : d)}
            style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", background: (d === "All" ? !domain : domain === d) ? COLORS.indigo : "#F3F4F6", color: (d === "All" ? !domain : domain === d) ? "#fff" : "#374151", transition: "all 0.2s" }}>{d}</span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {filtered.map(st => (
          <Card key={st.id} style={{ position: "relative", overflow: "hidden", transition: "all 0.3s" }} className="hover-card">
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: domainColors[st.domain] || COLORS.indigo }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>{st.name}</div>
              <Badge label={st.domain} color={domainColors[st.domain] || COLORS.indigo} />
            </div>
            <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{st.problem}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              <Badge label={`👤 ${st.team} member${st.team > 1 ? "s" : ""}`} color={COLORS.slate} />
              <Badge label={`📍 ${st.stage}`} color={st.stage === "Growth" ? COLORS.green : st.stage === "MVP" ? COLORS.amber : COLORS.indigo} />
              {st.needed.slice(0, 2).map(r => <Badge key={r} label={`Need: ${r}`} color={COLORS.violet} />)}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>by {st.owner}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" variant="secondary" onClick={() => setSelected(st)}>View</Button>
                <Button size="sm" onClick={() => applyToStartup(st)}
                  variant={applied.includes(st.id) ? "success" : "primary"}>
                  {applied.includes(st.id) ? "✓ Applied" : "Join"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p>No startups found matching your search</p>
        </div>
      )}

      {/* Startup Detail Modal */}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <Badge label={selected.domain} color={domainColors[selected.domain] || COLORS.indigo} />
            <Badge label={selected.stage} color={selected.stage === "Growth" ? COLORS.green : COLORS.amber} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>Problem Statement</div>
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6 }}>{selected.problem}</p>
          </div>
          <div style={{ background: COLORS.lavender, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {[["Team Size", selected.team], ["Stage", selected.stage], ["Owner", selected.owner], ["Roles Needed", selected.needed.join(", ")]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11, color: "#9CA3AF" }}>{k}</div><div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 13 }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 8 }}>Roles Needed</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{selected.needed.map(r => <Badge key={r} label={r} color={COLORS.violet} />)}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => { applyToStartup(selected); setSelected(null); }} style={{ flex: 1 }}>
              {applied.includes(selected.id) ? "✓ Already Applied" : "Apply to Join"}
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)} style={{ flex: 1 }}>Close</Button>
          </div>
        </Modal>
      )}

      {/* Create Startup Modal */}
      {showCreate && (
        <Modal title="Launch Your Startup 🚀" onClose={() => setShowCreate(false)}>
          <Input label="Startup Name *" value={newStartup.name} onChange={v => setNewStartup(p => ({ ...p, name: v }))} placeholder="e.g. MediSync" />
          <Select label="Domain" value={newStartup.domain} onChange={v => setNewStartup(p => ({ ...p, domain: v }))}
            options={["AI", "Healthcare", "Education", "Agriculture", "FinTech", "IoT", "Cybersecurity"].map(d => ({ value: d, label: d }))} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Problem Statement</label>
            <textarea value={newStartup.problem} onChange={e => setNewStartup(p => ({ ...p, problem: e.target.value }))} placeholder="What problem does your startup solve?" rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Solution</label>
            <textarea value={newStartup.solution} onChange={e => setNewStartup(p => ({ ...p, solution: e.target.value }))} placeholder="How does your startup solve this?" rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Developers Needed" value={newStartup.devsNeeded} onChange={v => setNewStartup(p => ({ ...p, devsNeeded: v }))} options={["0","1","2","3"].map(n => ({ value: n, label: n }))} />
            <Select label="Designers Needed" value={newStartup.designersNeeded} onChange={v => setNewStartup(p => ({ ...p, designersNeeded: v }))} options={["0","1","2","3"].map(n => ({ value: n, label: n }))} />
          </div>
          <Button onClick={createStartup} style={{ width: "100%", marginTop: 8 }}>🚀 Launch Startup</Button>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user }) {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "Alex Johnson", role: user?.role || "Developer", location: user?.location || "Bangalore", exp: user?.exp || "3 years", bio: "Passionate full-stack developer with a love for building AI-powered products that solve real-world problems.", github: "github.com/alexj", linkedin: "linkedin.com/in/alexj" });
  const [toast, setToast] = useState("");

  const dna = [
    { label: "Leadership", score: 78, icon: "👑" },
    { label: "Technical", score: 92, icon: "⚙️" },
    { label: "Creativity", score: 85, icon: "🎨" },
    { label: "Communication", score: 70, icon: "💬" },
    { label: "Risk-Taking", score: 65, icon: "🎲" },
  ];

  function save() {
    setEditMode(false);
    setToast("Profile updated successfully!");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Header Card */}
      <Card style={{ marginBottom: 24, background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a1060 100%)`, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(79,70,229,0.15)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          <Avatar initials={user?.avatar || "AJ"} size={80} />
          <div style={{ flex: 1 }}>
            {editMode ? (
              <Input value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", marginBottom: 8 }} />
            ) : (
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, margin: 0, marginBottom: 4 }}>{profile.name}</h1>
            )}
            <div style={{ color: "#A5B4FC", fontSize: 15 }}>{profile.role}</div>
            <div style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>📍 {profile.location} · {profile.exp} experience</div>
          </div>
          <Button onClick={editMode ? save : () => setEditMode(true)} variant="ghost">
            {editMode ? "💾 Save" : "✏️ Edit"}
          </Button>
        </div>
        {!editMode && <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 16, lineHeight: 1.7 }}>{profile.bio}</p>}
        {editMode && (
          <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
            style={{ width: "100%", marginTop: 12, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Founder DNA */}
        <Card>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.navy, marginBottom: 20 }}>🧬 Founder DNA Analysis</h3>
          {dna.map(d => (
            <div key={d.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: "#374151" }}>{d.icon} {d.label}</span>
                <span style={{ fontWeight: 700, color: COLORS.indigo, fontSize: 14 }}>{d.score}%</span>
              </div>
              <div style={{ background: "#E2E8F0", borderRadius: 8, height: 8 }}>
                <div style={{ width: `${d.score}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${COLORS.indigo}, ${COLORS.violet})`, transition: "width 1s" }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Skills & Interests */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 14 }}>⚡ Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(user?.skills?.length > 0 ? user.skills : ["React", "Python", "Node.js", "MySQL"]).map(sk => <Badge key={sk} label={sk} />)}
            </div>
          </Card>
          <Card>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 14 }}>🎯 Startup Interests</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(user?.interests?.length > 0 ? user.interests : ["AI", "FinTech", "Healthcare"]).map(int => <Badge key={int} label={int} color={COLORS.violet} />)}
            </div>
          </Card>
          <Card>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 14 }}>🔗 Portfolio & Links</h3>
            {editMode ? (
              <>
                <Input label="GitHub" value={profile.github} onChange={v => setProfile(p => ({ ...p, github: v }))} icon="💻" />
                <Input label="LinkedIn" value={profile.linkedin} onChange={v => setProfile(p => ({ ...p, linkedin: v }))} icon="💼" />
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="#" style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.indigo, textDecoration: "none", fontSize: 14 }}>💻 {profile.github}</a>
                <a href="#" style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.indigo, textDecoration: "none", fontSize: 14 }}>💼 {profile.linkedin}</a>
              </div>
            )}
          </Card>
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── WORKSPACE ───────────────────────────────────────────────────────────────
function WorkspacePage() {
  const [tasks, setTasks] = useState({
    todo: [{ id: 1, title: "Design landing page wireframes", assignee: "Sneha R." }, { id: 2, title: "Set up database schema", assignee: "Arjun M." }],
    inprogress: [{ id: 3, title: "Build user authentication", assignee: "You" }, { id: 4, title: "Market research report", assignee: "Rahul G." }],
    completed: [{ id: 5, title: "Project kickoff meeting", assignee: "All" }, { id: 6, title: "Define MVP features", assignee: "You" }],
  });
  const [messages, setMessages] = useState([
    { id: 1, sender: "Arjun M.", text: "Hey team! Database schema is ready for review.", time: "10:30 AM", avatar: "AM" },
    { id: 2, sender: "Sneha R.", text: "Wireframes are looking great. Will share in the doc repo.", time: "10:45 AM", avatar: "SR" },
    { id: 3, sender: "You", text: "Awesome! Let's schedule a review call tomorrow.", time: "11:00 AM", avatar: "YO" },
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [newTask, setNewTask] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const chatRef = useRef(null);

  function sendMessage() {
    if (!newMsg.trim()) return;
    setMessages(p => [...p, { id: Date.now(), sender: "You", text: newMsg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), avatar: "YO" }]);
    setNewMsg("");
    setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
  }

  function addTask() {
    if (!newTask.trim()) return;
    setTasks(p => ({ ...p, todo: [...p.todo, { id: Date.now(), title: newTask, assignee: "Unassigned" }] }));
    setNewTask("");
    setToast("Task added!");
  }

  function moveTask(task, from, to) {
    setTasks(p => ({
      ...p,
      [from]: p[from].filter(t => t.id !== task.id),
      [to]: [...p[to], task],
    }));
  }

  const cols = [
    { key: "todo", label: "📋 To Do", color: "#F59E0B", next: "inprogress" },
    { key: "inprogress", label: "⚡ In Progress", color: COLORS.indigo, next: "completed" },
    { key: "completed", label: "✅ Completed", color: COLORS.green, next: null },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.navy }}>Team Workspace</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ avatar: "AM" }, { avatar: "SR" }, { avatar: "RG" }].map(m => <Avatar key={m.avatar} initials={m.avatar} size={32} />)}
          </div>
          <span style={{ fontSize: 13, color: "#6B7280" }}>MediSync Team · 3 members</span>
          <Badge label="MVP Stage" color={COLORS.amber} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#F3F4F6", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {["tasks", "chat", "docs"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
              background: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? COLORS.indigo : "#6B7280",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
            {tab === "tasks" ? "📋 Tasks" : tab === "chat" ? "💬 Team Chat" : "📁 Documents"}
          </button>
        ))}
      </div>

      {/* TASKS */}
      {activeTab === "tasks" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Add a new task..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }} />
            <Button onClick={addTask}>Add Task</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {cols.map(col => (
              <div key={col.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: COLORS.navy, fontSize: 15 }}>{col.label}</span>
                  <span style={{ background: col.color + "20", color: col.color, borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{tasks[col.key].length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                  {tasks[col.key].map(task => (
                    <div key={task.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderLeft: `4px solid ${col.color}` }}>
                      <div style={{ fontSize: 14, color: "#374151", marginBottom: 8, lineHeight: 1.5 }}>{task.title}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>👤 {task.assignee}</span>
                        {col.next && <Button size="sm" variant="secondary" onClick={() => moveTask(task, col.key, col.next)} style={{ fontSize: 11, padding: "3px 10px" }}>Move →</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CHAT */}
      {activeTab === "chat" && (
        <Card style={{ display: "flex", flexDirection: "column", height: 500 }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: m.sender === "You" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                <Avatar initials={m.avatar} size={36} />
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4, textAlign: m.sender === "You" ? "right" : "left" }}>{m.sender} · {m.time}</div>
                  <div style={{ background: m.sender === "You" ? `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})` : "#F3F4F6", color: m.sender === "You" ? "#fff" : "#374151", borderRadius: 14, padding: "10px 14px", fontSize: 14, lineHeight: 1.6 }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }} />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </Card>
      )}

      {/* DOCS */}
      {activeTab === "docs" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "📄", name: "Business Plan v2.pdf", size: "1.2 MB", date: "Jun 18" },
            { icon: "📊", name: "Pitch Deck - Investors.pptx", size: "3.8 MB", date: "Jun 15" },
            { icon: "🗄️", name: "Database Schema.sql", size: "48 KB", date: "Jun 12" },
            { icon: "📝", name: "Product Requirements.docx", size: "256 KB", date: "Jun 10" },
            { icon: "🎨", name: "UI Wireframes.fig", size: "5.1 MB", date: "Jun 8" },
            { icon: "📈", name: "Market Research.xlsx", size: "890 KB", date: "Jun 5" },
          ].map(doc => (
            <Card key={doc.name} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} className="hover-card">
              <div style={{ fontSize: 32 }}>{doc.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                <div style={{ color: "#9CA3AF", fontSize: 12 }}>{doc.size} · {doc.date}</div>
              </div>
              <Button size="sm" variant="secondary" style={{ fontSize: 11 }}>⬇</Button>
            </Card>
          ))}
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed #D1D5DB`, cursor: "pointer", minHeight: 80, background: "#F9FAFB" }}>
            <div style={{ textAlign: "center", color: "#9CA3AF" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>+</div>
              <div style={{ fontSize: 13 }}>Upload Document</div>
            </div>
          </Card>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── MENTORS ─────────────────────────────────────────────────────────────────
function MentorsPage() {
  const [filter, setFilter] = useState("");
  const [booked, setBooked] = useState([]);
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(null);
  const [mentors, setMentors] = useState(MOCK_MENTORS);

  useEffect(() => { api("/mentors").then(setMentors).catch(() => {}); }, []);

  const filtered = mentors.filter(m => !filter || m.domains.some(d => d.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.navy, marginBottom: 6 }}>Mentor Marketplace</h1>
      <p style={{ color: "#6B7280", marginBottom: 28 }}>Connect with industry experts to accelerate your startup journey</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["", "Technology", "Marketing", "Business", "Fundraising"].map(f => (
          <span key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", background: filter === f ? COLORS.indigo : "#F3F4F6", color: filter === f ? "#fff" : "#374151", transition: "all 0.2s" }}>
            {f || "All Domains"}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {filtered.map(m => (
          <Card key={m.id} style={{ transition: "all 0.3s" }} className="hover-card">
            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
              <Avatar initials={m.avatar} size={60} color={COLORS.violet} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.navy }}>{m.name}</div>
                <div style={{ color: "#6B7280", fontSize: 13 }}>{m.expertise}</div>
                <div style={{ color: "#9CA3AF", fontSize: 12 }}>{m.company} · {m.exp}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span style={{ color: "#F59E0B", fontSize: 13 }}>⭐</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.navy }}>{m.rating}</span>
                  <span style={{ color: "#9CA3AF", fontSize: 12 }}>· {m.sessions} sessions</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {m.domains.map(d => <Badge key={d} label={d} color={COLORS.violet} />)}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button size="sm" variant="secondary" onClick={() => setSelected(m)} style={{ flex: 1 }}>View Profile</Button>
              <Button size="sm" onClick={() => { setBooked(p => [...p, m.id]); setToast(`Session booked with ${m.name}!`); }} variant={booked.includes(m.id) ? "success" : "primary"} style={{ flex: 1 }}>
                {booked.includes(m.id) ? "✓ Booked" : "📅 Book Session"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <Avatar initials={selected.avatar} size={64} color={COLORS.violet} />
            <div>
              <div style={{ color: "#6B7280" }}>{selected.expertise}</div>
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>{selected.company}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {selected.domains.map(d => <Badge key={d} label={d} color={COLORS.violet} />)}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: COLORS.lavender, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            {[["Experience", selected.exp], ["Rating", `⭐ ${selected.rating}`], ["Sessions", selected.sessions]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: COLORS.navy, fontSize: 18 }}>{v}</div>
                <div style={{ color: "#6B7280", fontSize: 12 }}>{k}</div>
              </div>
            ))}
          </div>
          <Button onClick={() => { setBooked(p => [...p, selected.id]); setToast(`Session booked with ${selected.name}!`); setSelected(null); }} style={{ width: "100%" }}>
            📅 Book a Mentorship Session
          </Button>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── INVESTORS ────────────────────────────────────────────────────────────────
function InvestorsPage() {
  const [toast, setToast] = useState("");
  const [contacted, setContacted] = useState([]);
  const [selected, setSelected] = useState(null);
  const [investors, setInvestors] = useState(MOCK_INVESTORS);
  const [topStartups, setTopStartups] = useState(MOCK_STARTUPS);

  useEffect(() => {
    api("/investors").then(setInvestors).catch(() => {});
    api("/startups").then(setTopStartups).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.navy, marginBottom: 6 }}>Investor Zone</h1>
      <p style={{ color: "#6B7280", marginBottom: 32 }}>Connect with investors who are actively funding startups in your domain</p>

      {/* Top Startups for Investors */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy}, #1a1060)`, borderRadius: 20, padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>🏆 Top Startups This Week</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {topStartups.slice(0, 3).map((st, i) => (
            <div key={st.id} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#fff", fontSize: 15 }}>{st.name}</span>
                <span style={{ background: ["#F59E0B","#94A3B8","#CD7F32"][i] + "30", color: ["#F59E0B","#94A3B8","#CD7F32"][i], padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>#{i + 1}</span>
              </div>
              <Badge label={st.domain} color="#818CF8" />
              <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 8 }}>Team: {st.team} · Stage: {st.stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Investors */}
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: COLORS.navy, marginBottom: 16 }}>Active Investors</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {investors.map(inv => (
          <Card key={inv.id} style={{ textAlign: "center" }}>
            <Avatar initials={inv.avatar} size={64} color={COLORS.green} />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.navy, marginTop: 12 }}>{inv.name}</div>
            <div style={{ color: "#6B7280", fontSize: 13 }}>{inv.org}</div>
            <div style={{ background: COLORS.lavender, borderRadius: 10, padding: "10px 14px", margin: "12px 0", textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Investment Focus</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{inv.interest}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Stage: {inv.stage}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>Portfolio: {inv.portfolio} companies</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => setSelected(inv)} style={{ flex: 1 }}>View</Button>
              <Button size="sm" onClick={() => { setContacted(p => [...p, inv.id]); setToast(`Contact request sent to ${inv.name}!`); }} variant={contacted.includes(inv.id) ? "success" : "primary"} style={{ flex: 1 }}>
                {contacted.includes(inv.id) ? "✓ Sent" : "Contact"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <Avatar initials={selected.avatar} size={64} color={COLORS.green} />
            <div>
              <div style={{ color: "#6B7280" }}>{selected.org}</div>
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>{selected.stage}</div>
            </div>
          </div>
          <div style={{ background: COLORS.lavender, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[["Organization", selected.org], ["Focus Areas", selected.interest], ["Investment Stage", selected.stage], ["Portfolio Size", `${selected.portfolio} startups`]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11, color: "#9CA3AF" }}>{k}</div><div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 13 }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => { setContacted(p => [...p, selected.id]); setToast(`Contact request sent to ${selected.name}!`); setSelected(null); }} style={{ flex: 1 }}>Send Pitch Deck</Button>
            <Button variant="secondary" onClick={() => setSelected(null)} style={{ flex: 1 }}>Schedule Meeting</Button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── AI EVALUATOR ────────────────────────────────────────────────────────────
function AIEvaluatorPage() {
  const [idea, setIdea] = useState("");
  const [problem, setProblem] = useState("");
  const [segment, setSegment] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function evaluate() {
    if (!idea) return;
    setLoading(true);
    setResult(null);
    const res = await callClaude(null, null, "/ai/evaluate", { idea: `${idea}\nProblem: ${problem}\nMarket Segment: ${segment}` });
    setResult(res);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.lavender, border: `1px solid ${COLORS.indigo}30`, borderRadius: 20, padding: "6px 16px", marginBottom: 16 }}>
          <span>🤖</span><span style={{ color: COLORS.indigo, fontWeight: 600, fontSize: 13 }}>Powered by FoundrAI Engine</span>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 800, color: COLORS.navy }}>AI Startup Evaluator</h1>
        <p style={{ color: "#6B7280", fontSize: 16 }}>Get instant AI analysis of your startup idea's market potential</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Startup Idea *</label>
          <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="Describe your startup idea in detail..." rows={3}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <Input label="Problem Statement" value={problem} onChange={setProblem} placeholder="What specific problem does it solve?" />
        <Input label="Target Market Segment" value={segment} onChange={setSegment} placeholder="e.g. SME Healthcare, Urban Millennials..." />
        <Button onClick={evaluate} disabled={loading || !idea} style={{ width: "100%" }}>
          {loading ? "🔄 Analyzing your startup..." : "🚀 Evaluate My Startup"}
        </Button>
      </Card>

      {loading && (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 2s linear infinite" }}>🤖</div>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.navy }}>Analyzing your startup idea...</div>
          <div style={{ color: "#6B7280", marginTop: 8 }}>Our AI is evaluating market potential, competition, and risks</div>
        </Card>
      )}

      {result && (
        <Card>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: COLORS.navy, marginBottom: 20 }}>📊 AI Evaluation Report</h2>
          <div style={{ background: COLORS.lavender, borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.indigo, marginBottom: 6 }}>"{idea}"</div>
            <div style={{ color: "#6B7280", fontSize: 13 }}>Evaluated on {new Date().toLocaleDateString()}</div>
          </div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#374151", fontSize: 14, fontFamily: "'Inter', sans-serif" }}>{result}</div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #F3F4F6", display: "flex", gap: 12 }}>
            <Button onClick={evaluate} variant="secondary">Re-evaluate</Button>
            <Button onClick={() => { setResult(null); setIdea(""); setProblem(""); setSegment(""); }}>Start New</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── AI PITCH GENERATOR ───────────────────────────────────────────────────────
function PitchGeneratorPage() {
  const [idea, setIdea] = useState("");
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  async function generatePitch() {
    if (!idea.trim()) return;
    setLoading(true);
    setPitch(null);
    const res = await callClaude(null, null, "/ai/pitch", { idea });
    setPitch(res);
    setLoading(false);
  }

  function copyPitch() {
    navigator.clipboard.writeText(pitch || "").then(() => setToast("Pitch copied to clipboard!"));
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 800, color: COLORS.navy }}>AI Pitch Generator</h1>
        <p style={{ color: "#6B7280", fontSize: 16 }}>Transform your startup idea into a polished investor pitch instantly</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Describe Your Startup Idea *</label>
          <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="e.g. An AI-powered platform that connects rural farmers with urban markets, using computer vision to assess crop quality and match with best buyers in real-time..." rows={5}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <Button onClick={generatePitch} disabled={loading || !idea.trim()} size="lg" style={{ width: "100%" }}>
          {loading ? "✨ Crafting your pitch..." : "✨ Generate Investor Pitch"}
        </Button>
      </Card>

      {loading && (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16, display: "inline-block", animation: "spin 2s linear infinite" }}>✨</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.navy }}>Crafting your investor pitch...</div>
          <div style={{ color: "#6B7280", marginTop: 8 }}>Generating problem statement, solution, value prop & elevator pitch</div>
        </Card>
      )}

      {pitch && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>🎤 Your Investor Pitch</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <Button size="sm" variant="secondary" onClick={copyPitch}>📋 Copy</Button>
              <Button size="sm" onClick={generatePitch}>Regenerate</Button>
            </div>
          </div>
          <div style={{ background: COLORS.lavender, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Startup Idea</div>
            <div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 14 }}>{idea}</div>
          </div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, color: "#374151", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: pitch.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0F1629;font-size:15px;display:block;margin:18px 0 8px;font-family:Space Grotesk,sans-serif">$1</strong>') }} />
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #F3F4F6", display: "flex", gap: 10 }}>
            <Button onClick={copyPitch} style={{ flex: 1 }}>📋 Copy Full Pitch</Button>
            <Button variant="secondary" onClick={() => { setPitch(null); setIdea(""); }} style={{ flex: 1 }}>Generate New</Button>
          </div>
        </Card>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function FoundrAI() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  // Restore session on reload if a token is already stored
  useEffect(() => {
    const token = localStorage.getItem("foundrai_token");
    if (!token) return;
    api("/auth/me", { auth: true }).then(({ user }) => setUser(user)).catch(() => localStorage.removeItem("foundrai_token"));
  }, []);

  const navItems = [
    { key: "dashboard", label: "🏠 Dashboard" },
    { key: "matching", label: "🤝 Find Co-Founder" },
    { key: "startups", label: "💡 Startups" },
    { key: "workspace", label: "🛠️ Workspace" },
    { key: "mentors", label: "🎓 Mentors" },
    { key: "investors", label: "💰 Investors" },
    { key: "evaluator", label: "🤖 AI Evaluator" },
    { key: "pitch", label: "🎤 Pitch Generator" },
    { key: "profile", label: "👤 Profile" },
  ];

  // NOTE: LandingPage only ever calls navigate() right after it has just
  // obtained a fresh user (post-login/post-register) — gating this on the
  // outer `user` state here would read a stale closure value (React state
  // updates aren't synchronous), bouncing the user straight back to the
  // landing page even though login/register succeeded. So this is
  // intentionally a plain, ungated setPage; LandingPage's own goOrLogin()
  // already handles routing unauthenticated nav clicks to the login modal.
  if (page === "landing") {
    return <LandingPage navigate={setPage} setUser={setUser} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .hover-card { transition: all 0.3s !important; }
        .hover-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(79,70,229,0.12) !important; }
        .pulse-ring { animation: pulse 2.5s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,0.3)} 50%{box-shadow:0 0 0 8px rgba(79,70,229,0)} }
      `}</style>

      {/* App Nav */}
      <nav style={{ background: COLORS.navy, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(15,22,41,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setPage("landing")}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>Foundr<span style={{ color: "#818CF8" }}>AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setPage(item.key)}
              style={{ background: page === item.key ? "rgba(79,70,229,0.3)" : "transparent", border: page === item.key ? `1px solid rgba(79,70,229,0.5)` : "1px solid transparent", color: page === item.key ? "#A5B4FC" : "#94A3B8", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", fontFamily: "'Inter', sans-serif" }}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={user?.avatar || "U"} size={34} />
          <span style={{ color: "#94A3B8", fontSize: 13 }}>{user?.name?.split(" ")[0]}</span>
          <button onClick={() => { localStorage.removeItem("foundrai_token"); setUser(null); setPage("landing"); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8", padding: "4px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Logout</button>
        </div>
      </nav>

      {/* Page Content */}
      <div>
        {page === "dashboard" && <Dashboard user={user} navigate={setPage} />}
        {page === "matching" && <MatchingPage user={user} navigate={setPage} />}
        {page === "startups" && <StartupsPage navigate={setPage} />}
        {page === "workspace" && <WorkspacePage />}
        {page === "mentors" && <MentorsPage />}
        {page === "investors" && <InvestorsPage />}
        {page === "evaluator" && <AIEvaluatorPage />}
        {page === "pitch" && <PitchGeneratorPage />}
        {page === "profile" && <ProfilePage user={user} />}
      </div>
    </div>
  );
}
