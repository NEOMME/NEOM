import { NEOM_KNOWLEDGE } from "@/lib/data";
import { fetchAdminData } from "@/lib/db/queries";
import { approveStagingUniversity, runUniversityResearch } from "@/lib/ai/research";
import type { StagingUniversity } from "@/lib/types";
import { getMaxContextChars } from "@/lib/ai/config";
import type { User } from "@/lib/types";

type AdminData = Awaited<ReturnType<typeof fetchAdminData>>;

function formatStats(data: AdminData): string {
  const pending = data.staging.filter((s) => s.status === "pending").length;
  const submitted = data.applications.filter((a) => a.status === "submitted").length;
  const published = data.universities.filter((u) => u.published).length;
  return `Platform stats:
- Students/users: ${data.users.length}
- Applications: ${data.applications.length} (${submitted} submitted, ${data.applications.filter((a) => a.status === "under_review").length} under review)
- Universities: ${data.universities.length} (${published} published)
- Research staging: ${data.staging.length} total (${pending} pending review)
- Promotions: ${data.promotions.filter((p) => p.active).length} active
- Email campaigns: ${data.emailCampaigns.length}`;
}

function formatApplications(data: AdminData, limit: number): string {
  if (data.applications.length === 0) return "Applications: none yet.";
  return (
    "Applications (most recent):\n" +
    data.applications.slice(0, limit).map((a) => {
      const docs =
        a.documents.length > 0
          ? a.documents.map((d) => d.fileName).join(", ")
          : "no files listed";
      return `- ${a.studentName} <${a.studentEmail}> → ${a.universityName} (${a.countryName}) | status=${a.status} | id=${a.id} | docs=${docs} | notes=${a.notes || "—"}`;
    }).join("\n")
  );
}

function formatStaging(data: AdminData, limit: number): string {
  const pending = data.staging.filter((s) => s.status === "pending");
  if (pending.length === 0) return "Research staging: no pending entries.";
  return (
    "Pending research (staging):\n" +
    pending.slice(0, limit).map((s) => {
      return `- ${s.name} | country=${s.countryId ?? "?"} | programs=${s.programs.slice(0, 4).join(", ")} | id=${s.id} | source=${s.sourceUrl ?? "n/a"}`;
    }).join("\n")
  );
}

function formatUniversities(data: AdminData, limit: number): string {
  return (
    "University catalog:\n" +
    data.universities.slice(0, limit).map((u) => {
      return `- ${u.name} | id=${u.id} | ${u.published ? "published" : "unpublished"} | tuition=${u.tuition} | deadline=${u.deadline}`;
    }).join("\n")
  );
}

function formatUsers(data: AdminData, limit: number): string {
  if (data.users.length === 0) return "Users: none in database.";
  return (
    "Users:\n" +
    data.users.slice(0, limit).map((u) => `- ${u.name} <${u.email}> role=${u.role} id=${u.id}`).join("\n")
  );
}

export function formatAdminDataForMessage(data: AdminData, message: string): string {
  const lower = message.toLowerCase();
  const parts = [formatStats(data)];

  if (lower.match(/application|applicant|student|submit|status|review|accept|reject|document/)) {
    parts.push(formatApplications(data, 15));
  }
  if (lower.match(/research|staging|discover|pending review|pipeline/)) {
    parts.push(formatStaging(data, 12));
  }
  if (lower.match(/universit|catalog|partner|tuition|deadline|program/)) {
    parts.push(formatUniversities(data, 20));
  }
  if (lower.match(/user|signup|account|profile|admin/)) {
    parts.push(formatUsers(data, 12));
  }

  if (parts.length === 1) {
    parts.push(formatApplications(data, 8));
    parts.push(formatStaging(data, 5));
  }

  const max = getMaxContextChars();
  let text = parts.join("\n\n");
  if (text.length > max) text = `${text.slice(0, max)}\n…(truncated)`;
  return text;
}

function cleanUniversityQuery(raw: string): string {
  return raw
    .replace(/\s+and\s+(?:add|publish|include|approve)\s*(?:it|them)?.*$/i, "")
    .replace(/\b(to the platform|to catalog|to neom)\b/gi, "")
    .replace(/[.!?]+$/, "")
    .trim();
}

function parseUniversitySearchIntent(
  message: string
): { query: string; autoAdd: boolean } | null {
  const autoAdd = /\b(add(?:\s+it|\s+them)?|publish|include|put in catalog|approve)\b/i.test(
    message
  );

  const patterns = [
    /\bsearch\s+(?:for\s+)?(.+)/i,
    /\b(?:find|look up|research)\s+(?:for\s+)?(.+)/i,
    /\badd\s+(?:the\s+)?(.+)/i,
  ];

  for (const re of patterns) {
    const m = message.match(re);
    if (!m?.[1]) continue;
    const query = cleanUniversityQuery(m[1]);
    if (query.length >= 3) {
      return { query, autoAdd };
    }
  }

  return null;
}

function pickBestStagingMatch(
  results: StagingUniversity[],
  query: string
): StagingUniversity | undefined {
  if (results.length === 0) return undefined;
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);

  let best = results[0];
  let bestScore = -1;

  for (const r of results) {
    const name = r.name.toLowerCase();
    let score = 0;
    if (name.includes(q) || q.includes(name)) score += 10;
    for (const t of tokens) {
      if (name.includes(t)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }

  return best;
}

function findExistingUniversity(data: AdminData, query: string) {
  const q = query.toLowerCase();
  return data.universities.find(
    (u) =>
      u.name.toLowerCase() === q ||
      u.name.toLowerCase().includes(q) ||
      q.includes(u.name.toLowerCase())
  );
}

async function runSearchAndOptionalAdd(
  query: string,
  autoAdd: boolean,
  profile: User,
  data: AdminData
): Promise<{ directReply?: string; researchSummary?: string }> {
  const existing = findExistingUniversity(data, query);
  if (existing) {
    const vis = existing.published ? "published for students" : "in catalog (unpublished)";
    return {
      directReply: `${existing.name} is already ${vis}.\n- University id: ${existing.id}\n- Tuition: ${existing.tuition}\n- Deadline: ${existing.deadline}\n\nOpen Admin → Universities to edit or publish.`,
    };
  }

  try {
    let results = await runUniversityResearch({ query }, profile);

    if (results.length === 0) {
      results = await runUniversityResearch(
        { query: `${query} university official programs tuition` },
        profile
      );
    }

    if (results.length === 0) {
      return {
        directReply: `I couldn't find reliable data for "${query}". Try Admin → Research with a longer query, or set TAVILY_API_KEY for live web search.`,
      };
    }

    const names = results.map((r) => r.name).join("; ");

    if (!autoAdd) {
      return {
        directReply: `Research complete for "${query}". Added to staging for review:\n${results.map((r) => `• ${r.name} (staging id: ${r.id})`).join("\n")}\n\nApprove in Admin → Research when ready.`,
        researchSummary: `Staging: ${names}`,
      };
    }

    const pick = pickBestStagingMatch(results, query);
    if (!pick) {
      return {
        directReply: `Research found candidates but none could be selected. Staging entries: ${names}. Approve manually in Admin → Research.`,
      };
    }

    const { staging, universityId } = await approveStagingUniversity(pick.id, profile, {
      publish: true,
    });

    const extras = results
      .filter((r) => r.id !== pick.id)
      .map((r) => r.name);
    const extraNote =
      extras.length > 0
        ? `\n\nOther matches left in staging: ${extras.join("; ")} (Admin → Research).`
        : "";

    return {
      directReply: `Added **${staging.name}** to the partner catalog and published it for students.

- Catalog id: ${universityId}
- Programs: ${staging.programs.slice(0, 5).join(", ") || "see Admin → Universities"}
- Tuition: ${staging.tuition}
- Source: ${staging.sourceUrl ?? "research pipeline"}

Students can now discover it under Universities.${extraNote}`,
      researchSummary: `Published: ${staging.name} (${universityId})`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return {
      directReply: `Could not search/add "${query}": ${msg}`,
    };
  }
}

export async function prepareAdminTurn(
  userMessage: string,
  profile: User
): Promise<{
  augmentedMessage: string;
  data: AdminData;
  researchSummary?: string;
  directReply?: string;
}> {
  const data = await fetchAdminData();
  const snapshot = formatAdminDataForMessage(data, userMessage);

  let researchSummary: string | undefined;
  let directReply: string | undefined;

  const searchIntent = parseUniversitySearchIntent(userMessage);
  const wantsUniversityAction =
    searchIntent &&
    /\b(search|find|look up|research|add|discover)\b/i.test(userMessage);

  if (wantsUniversityAction && searchIntent) {
    const action = await runSearchAndOptionalAdd(
      searchIntent.query,
      searchIntent.autoAdd,
      profile,
      data
    );
    directReply = action.directReply;
    researchSummary = action.researchSummary;
  }

  const augmentedMessage = [
    userMessage,
    "",
    "---",
    "Live platform data (authoritative — use this to answer):",
    snapshot,
    researchSummary ? `\n---\n${researchSummary}` : "",
    directReply ? `\n---\nAction already completed:\n${directReply}` : "",
  ].join("\n");

  return { augmentedMessage, data, researchSummary, directReply };
}

export function buildAdminKnowledgeContext(compact: boolean): string {
  const knowledge = compact
    ? "Neom (NEMP) is an AI-powered university application platform for students and admins."
    : NEOM_KNOWLEDGE.trim();
  return knowledge;
}

export async function buildAdminLiveContext(compact: boolean): Promise<string> {
  const data = await fetchAdminData();
  const snapshot = formatAdminDataForMessage(data, "overview stats applications research universities users");
  return `${buildAdminKnowledgeContext(compact)}

${formatStats(data)}

${snapshot}`;
}

export function fallbackAdminResponse(message: string, data: AdminData): string {
  const lower = message.toLowerCase();

  if (lower.match(/stat|overview|dashboard|how many/)) {
    return formatStats(data);
  }
  if (lower.match(/application|applicant|submit|student/)) {
    return formatApplications(data, 20);
  }
  if (lower.match(/research|staging|pending/)) {
    return `${formatStats(data)}\n\n${formatStaging(data, 15)}`;
  }
  if (lower.match(/universit|catalog/)) {
    return formatUniversities(data, 25);
  }
  if (lower.match(/user|account/)) {
    return formatUsers(data, 20);
  }

  return `${formatStats(data)}

${formatApplications(data, 5)}

${formatStaging(data, 5)}

I pulled live data from the platform. For full AI answers, configure GROQ_API_KEY or a larger QWEN model (smollm:135m is too small for reliable chat). You can still ask: "show applications", "platform stats", or "research universities in Germany".`;
}
