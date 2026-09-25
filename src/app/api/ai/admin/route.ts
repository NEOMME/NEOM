import { chatAdmin } from "@/lib/ai";
import { isNextResponse, requireAdmin } from "@/lib/auth";
import { getChatHistory, saveChatMessage } from "@/lib/db/queries";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const profile = await requireAdmin();
  if (isNextResponse(profile)) return profile;

  const history = await getChatHistory(profile.id, "admin");
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireAdmin();
    if (isNextResponse(profile)) return profile;

    const limit = rateLimit(`ai-admin:${profile.id}`, 20, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: limit.retryAfter },
        { status: 429 }
      );
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await saveChatMessage(profile.id, "user", message, "admin");
    const response = await chatAdmin(message, history ?? [], profile);
    await saveChatMessage(profile.id, "assistant", response, "admin");

    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    console.error("[admin-ai]", message);
    return NextResponse.json(
      { error: message, response: `Something went wrong: ${message}` },
      { status: 500 }
    );
  }
}
