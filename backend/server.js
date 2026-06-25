const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "foundrai-dev-secret-change-me";
const parseRow = (row, fields) => {
  if (!row) return row;
  const out = { ...row };
  fields.forEach(f => { try { out[f] = JSON.parse(row[f]); } catch { out[f] = []; } });
  return out;
};

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── AUTH ─────────────────────────────────────────────────────────
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, location, skills = [], interests = [] } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email, password are required" });
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const avatar = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const hashed = bcrypt.hashSync(password, 10);
  const info = db.prepare(`INSERT INTO users (name,email,password,role,location,avatar,exp,skills,interests)
    VALUES (@name,@email,@password,@role,@location,@avatar,@exp,@skills,@interests)`).run({
    name, email, password: hashed, role: role || "Developer", location: location || "",
    avatar, exp: "0 years", skills: JSON.stringify(skills), interests: JSON.stringify(interests),
  });
  const user = parseRow(db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid), ["skills", "interests"]);
  delete user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const user = parseRow(row, ["skills", "interests"]);
  delete user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

app.get("/api/auth/me", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const user = parseRow(row, ["skills", "interests"]);
  delete user.password;
  res.json({ user });
});

// ── FOUNDERS ─────────────────────────────────────────────────────
app.get("/api/founders", (req, res) => {
  const { role, location, skills, domain } = req.query;
  let rows = db.prepare("SELECT * FROM founders").all().map(r => parseRow(r, ["skills", "interests"]));
  if (role) rows = rows.filter(f => f.role.toLowerCase().includes(role.toLowerCase()));
  if (location) rows = rows.filter(f => f.location.toLowerCase().includes(location.toLowerCase()));
  if (skills) rows = rows.filter(f => f.skills.some(s => s.toLowerCase().includes(skills.toLowerCase())));
  if (domain) rows = rows.filter(f => f.interests.some(i => i.toLowerCase().includes(domain.toLowerCase())));
  res.json(rows.sort((a, b) => b.score - a.score));
});

app.post("/api/founders/:id/connect", auth, (req, res) => {
  const founderId = Number(req.params.id);
  const exists = db.prepare("SELECT * FROM connections WHERE user_id=? AND founder_id=?").get(req.user.id, founderId);
  if (exists) return res.json({ status: exists.status, alreadySent: true });
  db.prepare("INSERT INTO connections (user_id, founder_id, status) VALUES (?,?,'pending')").run(req.user.id, founderId);
  res.json({ status: "pending" });
});

// ── STARTUPS ─────────────────────────────────────────────────────
app.get("/api/startups", (req, res) => {
  const { search, domain } = req.query;
  let rows = db.prepare("SELECT * FROM startups").all().map(r => parseRow(r, ["needed"]));
  if (search) rows = rows.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.domain.toLowerCase().includes(search.toLowerCase()));
  if (domain && domain !== "All") rows = rows.filter(s => s.domain === domain);
  res.json(rows);
});

app.post("/api/startups", auth, (req, res) => {
  const { name, domain, problem, needed = ["Developer", "Designer"] } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const owner = db.prepare("SELECT name FROM users WHERE id=?").get(req.user.id)?.name || "You";
  const info = db.prepare(`INSERT INTO startups (name,domain,problem,team,needed,stage,owner)
    VALUES (?,?,?,?,?,?,?)`).run(name, domain || "AI", problem || "Problem TBD", 1, JSON.stringify(needed), "Idea", owner);
  res.json(parseRow(db.prepare("SELECT * FROM startups WHERE id=?").get(info.lastInsertRowid), ["needed"]));
});

app.post("/api/startups/:id/apply", auth, (req, res) => {
  const startupId = Number(req.params.id);
  const exists = db.prepare("SELECT * FROM applications WHERE user_id=? AND startup_id=?").get(req.user.id, startupId);
  if (exists) return res.json({ applied: true, alreadyApplied: true });
  db.prepare("INSERT INTO applications (user_id, startup_id) VALUES (?,?)").run(req.user.id, startupId);
  res.json({ applied: true });
});

// ── MENTORS ──────────────────────────────────────────────────────
app.get("/api/mentors", (req, res) => {
  const { domain } = req.query;
  let rows = db.prepare("SELECT * FROM mentors").all().map(r => parseRow(r, ["domains"]));
  if (domain) rows = rows.filter(m => m.domains.some(d => d.toLowerCase().includes(domain.toLowerCase())));
  res.json(rows);
});

// ── INVESTORS ────────────────────────────────────────────────────
app.get("/api/investors", (req, res) => {
  res.json(db.prepare("SELECT * FROM investors").all());
});

// ── AI MATCH SCORING (rule-based, no external API needed) ───────
app.post("/api/match", (req, res) => {
  const { skills = [], interests = [] } = req.body;
  const founders = db.prepare("SELECT * FROM founders").all().map(r => parseRow(r, ["skills", "interests"]));
  const scored = founders.map(f => {
    const skillOverlap = f.skills.filter(s => skills.includes(s)).length;
    const interestOverlap = f.interests.filter(i => interests.includes(i)).length;
    const score = Math.min(99, Math.round(50 + skillOverlap * 8 + interestOverlap * 10));
    return { ...f, score };
  }).sort((a, b) => b.score - a.score);
  res.json(scored);
});

app.get("/api/health", (req, res) => res.json({ ok: true, db: "sqlite", time: new Date().toISOString() }));

// ── AI-STYLE TEXT ENDPOINTS (template-based, work with zero API keys) ───
// If you want real Claude output instead, set ANTHROPIC_API_KEY and swap the
// body of these handlers for a server-side fetch to api.anthropic.com — never
// call Anthropic with a key from the browser.
app.post("/api/ai/match-explanation", (req, res) => {
  const { founder, user } = req.body || {};
  if (!founder) return res.status(400).json({ error: "founder is required" });
  const sharedSkills = (founder.skills || []).filter(s => (user?.skills || []).includes(s));
  const sharedInterests = (founder.interests || []).filter(i => (user?.interests || []).includes(i));
  const lines = [
    `• ${founder.score}% match driven by ${sharedSkills.length || "complementary"} ${sharedSkills.length ? "shared skills (" + sharedSkills.join(", ") + ")" : "skill sets that fill your gaps"}.`,
    `• Both interested in ${sharedInterests.length ? sharedInterests.join(", ") : (founder.interests || []).join(", ") || "overlapping domains"}, which helps align on vision early.`,
    `• ${founder.name} brings ${founder.exp} experience as a ${founder.role}, based in ${founder.location}.`,
    `• Availability: ${founder.availability} — worth confirming time commitment matches yours before committing.`,
  ];
  res.json({ text: lines.join("\n") });
});

app.post("/api/ai/evaluate", (req, res) => {
  const { idea } = req.body || {};
  if (!idea || !idea.trim()) return res.status(400).json({ error: "idea is required" });
  const words = idea.trim().split(/\s+/);
  const score = Math.min(95, 55 + Math.min(30, words.length) + (idea.toLowerCase().includes("ai") ? 5 : 0));
  const text = `**Problem Clarity**\nThe idea is described in ${words.length} words. ${words.length > 25 ? "Good level of detail — the problem and audience are reasonably clear." : "Consider adding more detail on who exactly is affected and how often."}\n\n**Market Potential**\nScore: ${score}/100. Ideas touching large, recurring pain points tend to score higher; niche or one-off problems score lower.\n\n**Differentiation**\nCheck whether 2-3 existing competitors already solve this, and articulate what's 10x better (speed, cost, accuracy, or access) rather than just "AI-powered."\n\n**Suggested Next Step**\nTalk to 5 potential users this week and validate the problem before building anything.`;
  res.json({ text, score });
});

app.post("/api/ai/pitch", (req, res) => {
  const { idea } = req.body || {};
  if (!idea || !idea.trim()) return res.status(400).json({ error: "idea is required" });
  const text = `**Problem**\n${idea}\n\n**Solution**\nA focused product that directly addresses the problem above, built for the people who feel it most acutely.\n\n**Value Proposition**\nFaster, cheaper, or more reliable than the status quo — pick the axis that matters most to your first 10 customers and lead with it.\n\n**Elevator Pitch**\n"We help [target users] solve [core problem] by [unique mechanism], so they can [desired outcome] without [current pain point]."\n\n**Ask**\nRaising a pre-seed/seed round to build the MVP, validate with early customers, and reach the next milestone.`;
  res.json({ text });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`FoundrAI API running on http://localhost:${PORT}`));
