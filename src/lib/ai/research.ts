import { isLLMAvailable } from "@/lib/ai/config";
import { callLLMText } from "@/lib/ai/llm";
import { mapStagingUniversity } from "@/lib/db/mappers";
import { createNotification } from "@/lib/db/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StagingUniversity, User } from "@/lib/types";

export interface ResearchRequest {
  query: string;
  countryId?: string;
  categoryId?: string;
}

interface ExtractedUniversity {
  name: string;
  description: string;
  tuition: string;
  ranking: number;
  programs: string[];
  deadline: string;
  sourceUrl?: string;
  researchNotes: string;
}

async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return `[Simulated research for: ${query}]\n\nNote: Set TAVILY_API_KEY for live web research. Using LLM knowledge extraction instead.`;
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: 5,
    }),
  });

  if (!res.ok) return `Web search failed for: ${query}`;
  const data = await res.json();
  const results = (data.results ?? []) as { title: string; content: string; url: string }[];
  return results
    .map((r) => `Title: ${r.title}\nURL: ${r.url}\n${r.content}`)
    .join("\n\n---\n\n");
}

async function extractUniversityData(
  query: string,
  searchResults: string,
  countryId?: string
): Promise<ExtractedUniversity[]> {
  if (!isLLMAvailable()) {
    return [
      {
        name: `${query} University (Research Draft)`,
        description: `Research draft for ${query}. Requires admin review before publishing.`,
        tuition: "Contact university",
        ranking: 0,
        programs: ["General Studies"],
        deadline: "Rolling",
        researchNotes: searchResults.slice(0, 500),
      },
    ];
  }

  const content = await callLLMText(
    [
      {
        role: "system",
        content: `Extract university information from search results. Return ONLY valid JSON with a "universities" array of objects:
{ "name", "description", "tuition", "ranking" (number), "programs" (string[]), "deadline", "sourceUrl", "researchNotes" }
Country hint: ${countryId ?? "any"}. Extract up to 3 universities. If data is uncertain, note it in researchNotes.`,
      },
      {
        role: "user",
        content: `Query: ${query}\n\nSearch results:\n${searchResults}`,
      },
    ],
    { temperature: 0.3, maxTokens: 2048, jsonMode: true }
  );
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    const list = Array.isArray(parsed) ? parsed : parsed.universities ?? parsed.results ?? [];
    return list.slice(0, 3) as ExtractedUniversity[];
  } catch {
    return [];
  }
}

export async function runUniversityResearch(
  request: ResearchRequest,
  profile: User
): Promise<StagingUniversity[]> {
  const searchResults = await searchWeb(
    `${request.query} university programs tuition deadline admission`
  );
  const extracted = await extractUniversityData(
    request.query,
    searchResults,
    request.countryId
  );

  const supabase = createAdminClient();
  const created: StagingUniversity[] = [];

  for (const uni of extracted) {
    const { data, error } = await supabase
      .from("universities_staging")
      .insert({
        name: uni.name,
        country_id: request.countryId ?? null,
        category_ids: request.categoryId ? [request.categoryId] : [],
        description: uni.description,
        tuition: uni.tuition,
        ranking: uni.ranking,
        programs: uni.programs,
        deadline: uni.deadline,
        source_url: uni.sourceUrl ?? null,
        research_notes: uni.researchNotes,
        status: "pending",
        researched_by: profile.id,
      })
      .select("*")
      .single();

    if (!error && data) {
      created.push(mapStagingUniversity(data));
    }
  }

  if (created.length > 0) {
    await createNotification({
      type: "research_complete",
      title: `${created.length} universities ready for review`,
      body: `Research for "${request.query}" found ${created.length} candidates. Review in Admin → Research.`,
      metadata: { query: request.query, count: created.length },
    });
  }

  return created;
}

export async function approveStagingUniversity(
  stagingId: string,
  profile: User
): Promise<{ staging: StagingUniversity; universityId: string }> {
  const supabase = createAdminClient();

  const { data: staging, error } = await supabase
    .from("universities_staging")
    .select("*")
    .eq("id", stagingId)
    .single();

  if (error || !staging) throw new Error("Staging entry not found");
  if (staging.status !== "pending") throw new Error("Already reviewed");

  const uniId = staging.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const uniqueId = `${uniId}-${Date.now().toString(36)}`;

  const { error: insertError } = await supabase.from("universities").insert({
    id: uniqueId,
    name: staging.name,
    country_id: staging.country_id ?? "us",
    description: staging.description,
    tuition: staging.tuition,
    ranking: staging.ranking,
    programs: staging.programs,
    deadline: staging.deadline,
    published: false,
  });

  if (insertError) throw insertError;

  const categoryIds = Array.isArray(staging.category_ids)
    ? (staging.category_ids as string[])
    : [];

  for (const catId of categoryIds) {
    await supabase.from("university_categories").insert({
      university_id: uniqueId,
      category_id: catId,
    });
  }

  await supabase
    .from("universities_staging")
    .update({
      status: "approved",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", stagingId);

  return {
    staging: mapStagingUniversity({ ...staging, status: "approved" }),
    universityId: uniqueId,
  };
}

export async function rejectStagingUniversity(
  stagingId: string,
  profile: User
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("universities_staging")
    .update({
      status: "rejected",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", stagingId);

  if (error) throw error;
}
