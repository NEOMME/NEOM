import { isNextResponse, requireAdmin } from "@/lib/auth";
import { runUniversityResearch } from "@/lib/ai/research";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await requireAdmin();
    if (isNextResponse(profile)) return profile;

    const limit = rateLimit(`ai-research:${profile.id}`, 5, 300_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Research rate limit exceeded", retryAfter: limit.retryAfter },
        { status: 429 }
      );
    }

    const { query, countryId, categoryId } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results = await runUniversityResearch(
      { query, countryId, categoryId },
      profile
    );

    return NextResponse.json({
      count: results.length,
      staging: results,
      message:
        results.length > 0
          ? `Found ${results.length} universities pending review.`
          : "No universities extracted. Try a different query or check API keys.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
