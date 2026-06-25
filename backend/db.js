const Database = require("./lib/sqlite-driver");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "foundrai.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT,
  location TEXT,
  avatar TEXT,
  exp TEXT,
  skills TEXT DEFAULT '[]',
  interests TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS founders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, role TEXT, location TEXT,
  skills TEXT, interests TEXT, score INTEGER,
  avatar TEXT, exp TEXT, availability TEXT
);

CREATE TABLE IF NOT EXISTS startups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, domain TEXT, problem TEXT,
  team INTEGER, needed TEXT, stage TEXT, owner TEXT
);

CREATE TABLE IF NOT EXISTS mentors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, expertise TEXT, exp TEXT, company TEXT,
  avatar TEXT, rating REAL, sessions INTEGER, domains TEXT
);

CREATE TABLE IF NOT EXISTS investors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, org TEXT, interest TEXT, stage TEXT,
  avatar TEXT, portfolio INTEGER
);

CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, founder_id INTEGER, status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, startup_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed only if empty
const seedIfEmpty = (table, rows, mapFn) => {
  const count = db.prepare(`SELECT COUNT(*) c FROM ${table}`).get().c;
  if (count === 0) {
    const cols = Object.keys(mapFn(rows[0]));
    const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(c => "@" + c).join(",")})`);
    const tx = db.transaction((items) => items.forEach(r => stmt.run(mapFn(r))));
    tx(rows);
    console.log(`Seeded ${table}: ${rows.length} rows`);
  }
};

const MOCK_FOUNDERS = [
  { name: "Arjun Mehta", role: "Full-Stack Developer", location: "Bangalore", skills: ["React", "Node.js", "Python"], interests: ["FinTech", "AI"], score: 94, avatar: "AM", exp: "4 years", availability: "Full-time" },
  { name: "Priya Sharma", role: "AI Engineer", location: "Mumbai", skills: ["Python", "TensorFlow", "LLMs"], interests: ["Healthcare", "AI"], score: 91, avatar: "PS", exp: "3 years", availability: "Full-time" },
  { name: "Rahul Gupta", role: "Business Analyst", location: "Delhi", skills: ["Finance", "Marketing", "Strategy"], interests: ["FinTech", "Education"], score: 87, avatar: "RG", exp: "5 years", availability: "Part-time" },
  { name: "Sneha Rao", role: "UI/UX Designer", location: "Hyderabad", skills: ["Figma", "Adobe XD", "CSS"], interests: ["EdTech", "Healthcare"], score: 85, avatar: "SR", exp: "3 years", availability: "Full-time" },
  { name: "Vikram Nair", role: "Marketing Expert", location: "Chennai", skills: ["SEO", "Growth", "Branding"], interests: ["Agriculture", "IoT"], score: 82, avatar: "VN", exp: "6 years", availability: "Full-time" },
  { name: "Ananya Patel", role: "Developer", location: "Pune", skills: ["Java", "Spring Boot", "MySQL"], interests: ["Cybersecurity", "FinTech"], score: 79, avatar: "AP", exp: "2 years", availability: "Full-time" },
];
const MOCK_STARTUPS = [
  { name: "MediSync", domain: "Healthcare", problem: "Fragmented patient records across hospitals", team: 2, needed: ["Developer", "Designer"], stage: "Idea", owner: "Priya S." },
  { name: "AgriBot", domain: "Agriculture", problem: "Small farmers lack access to precision farming", team: 3, needed: ["AI Engineer", "Marketer"], stage: "MVP", owner: "Vikram N." },
  { name: "EduChain", domain: "Education", problem: "Certificate verification is slow and fraud-prone", team: 1, needed: ["Developer", "Business Analyst", "Designer"], stage: "Idea", owner: "Rahul G." },
  { name: "FinGuard", domain: "FinTech", problem: "SMEs struggle with real-time financial monitoring", team: 2, needed: ["Developer", "Marketing Expert"], stage: "Growth", owner: "Arjun M." },
  { name: "SecureNet", domain: "Cybersecurity", problem: "SMBs cannot afford enterprise security tools", team: 2, needed: ["AI Engineer", "Designer"], stage: "MVP", owner: "Ananya P." },
];
const MOCK_MENTORS = [
  { name: "Dr. Rajesh Kumar", expertise: "AI & Deep Tech", exp: "18 years", company: "IIT Delhi", avatar: "RK", rating: 4.9, sessions: 240, domains: ["AI", "IoT", "Cybersecurity"] },
  { name: "Meera Nair", expertise: "Growth & Marketing", exp: "12 years", company: "Former CMO, Swiggy", avatar: "MN", rating: 4.8, sessions: 180, domains: ["Marketing", "Fundraising", "Business"] },
  { name: "Suresh Pillai", expertise: "FinTech & Blockchain", exp: "15 years", company: "HDFC Ventures", avatar: "SP", rating: 4.7, sessions: 150, domains: ["FinTech", "Business", "Fundraising"] },
  { name: "Kavita Joshi", expertise: "Product & UX Strategy", exp: "10 years", company: "Ex-Microsoft", avatar: "KJ", rating: 4.9, sessions: 200, domains: ["Technology", "Business"] },
];
const MOCK_INVESTORS = [
  { name: "Anil Kapoor", org: "Sequoia India", interest: "AI, FinTech", stage: "Seed to Series A", avatar: "AK", portfolio: 32 },
  { name: "Divya Menon", org: "Blume Ventures", interest: "EdTech, Healthcare", stage: "Pre-seed to Seed", avatar: "DM", portfolio: 28 },
  { name: "Rajan Tiwari", org: "Accel Partners", interest: "SaaS, Cybersecurity", stage: "Series A+", avatar: "RT", portfolio: 45 },
];

seedIfEmpty("founders", MOCK_FOUNDERS, f => ({ ...f, skills: JSON.stringify(f.skills), interests: JSON.stringify(f.interests) }));
seedIfEmpty("startups", MOCK_STARTUPS, s => ({ ...s, needed: JSON.stringify(s.needed) }));
seedIfEmpty("mentors", MOCK_MENTORS, m => ({ ...m, domains: JSON.stringify(m.domains) }));
seedIfEmpty("investors", MOCK_INVESTORS, i => i);

// Seed a demo login user so the demo works out of the box
const demo = db.prepare("SELECT * FROM users WHERE email = ?").get("demo@foundrai.com");
if (!demo) {
  db.prepare(`INSERT INTO users (name,email,password,role,location,avatar,exp,skills,interests)
    VALUES (@name,@email,@password,@role,@location,@avatar,@exp,@skills,@interests)`).run({
    name: "Demo Founder", email: "demo@foundrai.com",
    password: bcrypt.hashSync("password123", 10),
    role: "Developer", location: "Bangalore", avatar: "DF", exp: "3 years",
    skills: JSON.stringify(["React", "Python"]), interests: JSON.stringify(["AI", "FinTech"]),
  });
  console.log("Seeded demo user: demo@foundrai.com / password123");
}

module.exports = db;
