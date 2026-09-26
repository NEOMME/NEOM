import { chatAdmin } from "@/lib/ai";
import { getAdminAIStatus, isStaleAdminAssistantMessage } from "@/lib/ai/status";
import { isNextResponse, requireAdmin } from "@/lib/auth";
import { getChatHistory, saveChatMessage } from "@/lib/db/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const profile = await requireAdmin();
  if (isNextResponse(profile)) return profile;

  const rawHistory = await getChatHistory(profile.id, "admin");
  const history = rawHistory.filter(
    (m) => m.role === "user" || !isStaleAdminAssistantMessage(m.content)
  );

  return NextResponse.json({
    history,
    aiStatus: getAdminAIStatus(),
  });
}

export async function DELETE() {
  const profile = await requireAdmin();
  if (isNextResponse(profile)) return profile;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("profile_id", profile.id)
    .eq("agent_type", "admin");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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

    const saveUserPromise = saveChatMessage(profile.id, "user", message, "admin");
    const response = await chatAdmin(message, history ?? [], profile);
    await saveUserPromise;
    await saveChatMessage(profile.id, "assistant", response, "admin");

    return NextResponse.json({
      response,
      aiStatus: getAdminAIStatus(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    console.error("[admin-ai]", message);
    return NextResponse.json(
      { error: message, response: `Something went wrong: ${message}` },
      { status: 500 }
    );
  }
}
