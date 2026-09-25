import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const val = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local optional when vars are already exported
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const countries = [
  { id: "uk", name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { id: "us", name: "United States", code: "US", flag: "🇺🇸" },
  { id: "ca", name: "Canada", code: "CA", flag: "🇨🇦" },
  { id: "de", name: "Germany", code: "DE", flag: "🇩🇪" },
  { id: "au", name: "Australia", code: "AU", flag: "🇦🇺" },
  { id: "ae", name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { id: "sg", name: "Singapore", code: "SG", flag: "🇸🇬" },
  { id: "nl", name: "Netherlands", code: "NL", flag: "🇳🇱" },
];

const categories = [
  { id: "eng-tech", name: "Engineering & Technology", description: "Computer science, AI, robotics, and engineering programs", icon: "Cpu", color: "#06b6d4" },
  { id: "business", name: "Business & Economics", description: "MBA, finance, management, and entrepreneurship", icon: "TrendingUp", color: "#8b5cf6" },
  { id: "medicine", name: "Medicine & Health", description: "Medical, nursing, public health, and biomedical sciences", icon: "Heart", color: "#f43f5e" },
  { id: "arts", name: "Arts & Humanities", description: "Design, literature, philosophy, and creative arts", icon: "Palette", color: "#f59e0b" },
  { id: "science", name: "Natural Sciences", description: "Physics, chemistry, biology, and environmental science", icon: "Atom", color: "#10b981" },
  { id: "social", name: "Social Sciences", description: "Psychology, sociology, political science, and law", icon: "Users", color: "#3b82f6" },
];

const universities = [
  { id: "oxford", name: "University of Oxford", country_id: "uk", categoryIds: ["eng-tech", "business", "medicine", "science"], description: "World-renowned research university with exceptional academic standards.", tuition: "£28,000–£45,000/year", ranking: 1, programs: ["Computer Science", "MBA", "Medicine", "Law", "Physics"], deadline: "2026-01-15", published: true },
  { id: "mit", name: "Massachusetts Institute of Technology", country_id: "us", categoryIds: ["eng-tech", "science", "business"], description: "Leading institution for science, technology, and innovation.", tuition: "$57,000–$62,000/year", ranking: 2, programs: ["AI & Machine Learning", "Electrical Engineering", "Data Science", "MBA"], deadline: "2026-01-01", published: true },
  { id: "toronto", name: "University of Toronto", country_id: "ca", categoryIds: ["eng-tech", "medicine", "business", "social"], description: "Canada's top university with diverse programs and research opportunities.", tuition: "CAD 45,000–58,000/year", ranking: 18, programs: ["Computer Engineering", "Medicine", "Business Administration", "Psychology"], deadline: "2026-02-01", published: true },
  { id: "tum", name: "Technical University of Munich", country_id: "de", categoryIds: ["eng-tech", "science"], description: "Germany's premier technical university with low tuition fees.", tuition: "€150–€6,000/semester", ranking: 28, programs: ["Mechanical Engineering", "Informatics", "Physics", "Architecture"], deadline: "2026-03-15", published: true },
  { id: "melbourne", name: "University of Melbourne", country_id: "au", categoryIds: ["business", "medicine", "arts", "science"], description: "Australia's leading university with strong international reputation.", tuition: "AUD 42,000–55,000/year", ranking: 33, programs: ["Commerce", "Medicine", "Arts", "Environmental Science"], deadline: "2026-02-28", published: true },
  { id: "khalifa", name: "Khalifa University", country_id: "ae", categoryIds: ["eng-tech", "science", "medicine"], description: "Leading research university in the UAE focused on STEM excellence.", tuition: "AED 80,000–120,000/year", ranking: 181, programs: ["Aerospace Engineering", "Biomedical Engineering", "Computer Science"], deadline: "2026-04-01", published: true },
  { id: "nus", name: "National University of Singapore", country_id: "sg", categoryIds: ["eng-tech", "business", "medicine", "social"], description: "Asia's top university with world-class facilities and faculty.", tuition: "SGD 29,000–38,000/year", ranking: 8, programs: ["Computer Science", "Business Analytics", "Medicine", "Law"], deadline: "2026-02-15", published: true },
  { id: "delft", name: "Delft University of Technology", country_id: "nl", categoryIds: ["eng-tech", "science"], description: "Netherlands' largest and most comprehensive university of technology.", tuition: "€12,000–€18,000/year", ranking: 47, programs: ["Aerospace Engineering", "Civil Engineering", "Computer Science"], deadline: "2026-04-15", published: true },
];

const promotions = [
  { title: "Early Bird Application", description: "Apply before January 2026 and get free document verification.", discount: "Free verification", active: true, start_date: "2025-09-01", end_date: "2026-01-31" },
  { title: "STEM Excellence Scholarship", description: "Up to 25% tuition support for top STEM applicants.", discount: "25% tuition", active: true, start_date: "2025-09-01", end_date: "2026-06-30" },
];

async function main() {
  console.log("🌱 Seeding Neom platform data...\n");

  const { error: countriesErr } = await supabase.from("countries").upsert(countries);
  if (countriesErr) throw countriesErr;
  console.log("✓ Countries");

  const { error: categoriesErr } = await supabase.from("categories").upsert(categories);
  if (categoriesErr) throw categoriesErr;
  console.log("✓ Categories");

  for (const uni of universities) {
    const { categoryIds, ...row } = uni;
    const { error } = await supabase.from("universities").upsert(row);
    if (error) throw error;

    await supabase.from("university_categories").delete().eq("university_id", uni.id);
    const { error: catErr } = await supabase.from("university_categories").insert(
      categoryIds.map((category_id) => ({ university_id: uni.id, category_id }))
    );
    if (catErr) throw catErr;
  }
  console.log("✓ Universities");

  const { count: promoCount } = await supabase.from("promotions").select("*", { count: "exact", head: true });
  if (!promoCount) {
    const { error } = await supabase.from("promotions").insert(promotions);
    if (error) throw error;
    console.log("✓ Promotions");
  } else {
    console.log("• Promotions already exist, skipping");
  }

  console.log("\n✅ Seed complete!");
  console.log("\nUsers can sign up at /signup.");
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  if (err.message?.includes("Could not find the table")) {
    console.error("\nRun the migration first:");
    console.error("  1. Open Supabase SQL Editor");
    console.error("  2. Paste contents of supabase/migrations/001_initial_schema.sql");
    console.error("  3. Run npm run db:seed");
  }
  process.exit(1);
});
