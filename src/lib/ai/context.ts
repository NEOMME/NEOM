import { fetchPlatformData } from "@/lib/db/queries";
import { NEOM_KNOWLEDGE } from "@/lib/data";
import type { User } from "@/lib/types";

export async function buildLiveContext(profile: User, studentId?: string) {
  const data = await fetchPlatformData(studentId ?? profile.id);

  const uniList = data.universities
    .filter((u) => u.published)
    .map((u) => {
      const country = data.countries.find((c) => c.id === u.countryId);
      const cats = u.categoryIds
        .map((id) => data.categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      return `- ${u.name} (id: ${u.id}, ${country?.name ?? "Unknown"}): ${u.programs.join(", ")} | Tuition: ${u.tuition} | Deadline: ${u.deadline} | Ranking: ${u.ranking} | Categories: ${cats}`;
    })
    .join("\n");

  const catList = data.categories
    .map((c) => `- ${c.name} (id: ${c.id}): ${c.description}`)
    .join("\n");

  const countryList = data.countries
    .map((c) => `- ${c.name} (id: ${c.id}) ${c.flag}`)
    .join("\n");

  const myApps = data.applications
    .filter((a) => a.studentId === profile.id)
    .map(
      (a) =>
        `- ${a.universityName} (${a.countryName}): status=${a.status}, id=${a.id}, program notes: ${a.notes}`
    )
    .join("\n");

  return {
    data,
    contextText: `${NEOM_KNOWLEDGE}

Current student: ${profile.name} (${profile.email}), country: ${profile.country ?? "not set"}

Countries:
${countryList}

Categories:
${catList}

Partner Universities (${data.universities.filter((u) => u.published).length}):
${uniList || "None published yet."}

Student's applications:
${myApps || "No applications yet."}`,
  };
}

export function buildStudentSystemPrompt(contextText: string) {
  return `You are Neom AI, a friendly and knowledgeable assistant for the Neom Educational Mobility Platform (NEMP).
Help students understand our services, explore universities, and navigate the application process.
Be clear, encouraging, and specific. Use the tools available to search universities and get recommendations.
When recommending universities, explain why each is a good fit.
If asked about something not in context, say so honestly and suggest contacting support@neom.edu.

${contextText}`;
}

export function buildAdminSystemPrompt(contextText: string) {
  return `You are Neom Admin AI, the operations assistant for Neom (NEMP) administrators.
You help review student applications, run university research, manage the catalog, draft emails, and explain platform data.

Rules:
- Treat the "Live platform data" block in the user message as ground truth for counts, names, IDs, and statuses.
- When asked to research universities, confirm what was found in staging or suggest a specific research query.
- Cite student names, university names, and application IDs when listing applications.
- Be concise but complete; use bullet lists for multiple items.
- If data is missing from context, say what admin page to open (Applications, Research, Users, Universities).

${contextText}`;
}
