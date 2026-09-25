import type { Application, University, UniversityCategory, User } from "@/lib/types";

export interface RecommendationInput {
  gpa?: string;
  categoryId?: string;
  countryId?: string;
  maxTuition?: number;
  interests?: string;
}

export interface UniversityRecommendation {
  university: University;
  score: number;
  reasons: string[];
}

function parseTuition(tuition: string): number {
  const match = tuition.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

function parseGpa(gpa: string): number {
  const n = parseFloat(gpa);
  return Number.isFinite(n) ? n : 0;
}

export function recommendUniversities(
  universities: University[],
  categories: UniversityCategory[],
  profile: User,
  input: RecommendationInput = {}
): UniversityRecommendation[] {
  const gpa = parseGpa(input.gpa ?? "3.0");
  const maxTuition = input.maxTuition ?? Infinity;

  const scored = universities
    .filter((u) => u.published)
    .map((u) => {
      let score = 0;
      const reasons: string[] = [];

      if (input.countryId && u.countryId === input.countryId) {
        score += 30;
        reasons.push("Matches your preferred country");
      } else if (profile.country && u.countryId === profile.country) {
        score += 10;
        reasons.push("Located in your home region");
      }

      if (input.categoryId && u.categoryIds.includes(input.categoryId)) {
        score += 25;
        const cat = categories.find((c) => c.id === input.categoryId);
        reasons.push(`Strong in ${cat?.name ?? "your field"}`);
      }

      const tuition = parseTuition(u.tuition);
      if (tuition <= maxTuition) {
        score += 15;
        reasons.push("Within your budget range");
      } else {
        score -= 10;
      }

      if (u.ranking > 0 && u.ranking <= 50) {
        score += 20;
        reasons.push(`Top-ranked institution (#${u.ranking})`);
      } else if (u.ranking > 0 && u.ranking <= 100) {
        score += 10;
        reasons.push(`Well-ranked (#${u.ranking})`);
      }

      if (gpa >= 3.5 && u.ranking <= 30) {
        score += 10;
        reasons.push("Strong match for your academic profile");
      }

      if (input.interests) {
        const lower = input.interests.toLowerCase();
        const programMatch = u.programs.some((p) => p.toLowerCase().includes(lower));
        if (programMatch) {
          score += 20;
          reasons.push("Offers programs matching your interests");
        }
      }

      return { university: u, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}

export function summarizeRecommendations(recs: UniversityRecommendation[]): string {
  if (recs.length === 0) return "No matching universities found. Try broadening your criteria.";

  return recs
    .map(
      (r, i) =>
        `${i + 1}. **${r.university.name}** (score: ${r.score})\n   ${r.reasons.join("; ")}\n   Programs: ${r.university.programs.slice(0, 3).join(", ")}\n   Tuition: ${r.university.tuition} | Deadline: ${r.university.deadline}`
    )
    .join("\n\n");
}

export function applicationProgress(app: Application): number {
  if (app.steps.length === 0) return 0;
  const done = app.steps.filter((s) => s.completed).length;
  return Math.round((done / app.steps.length) * 100);
}
