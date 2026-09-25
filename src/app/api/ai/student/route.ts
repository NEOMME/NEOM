import { chatStudent } from "@/lib/ai";
import { isNextResponse, requireProfile } from "@/lib/auth";
import { getChatHistory, saveChatMessage } from "@/lib/db/queries";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const profile = await requireProfile();
  if (isNextResponse(profile)) return profile;

  const history = await getChatHistory(profile.id, "student");
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireProfile();
    if (isNextResponse(profile)) return profile;

    const limit = rateLimit(`ai-student:${profile.id}`, 30, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: limit.retryAfter },
        { status: 429 }
      );
    }

    const { message, history, context } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await saveChatMessage(profile.id, "user", message, "student");

    const enrichedMessage = context
      ? `${message}\n\n[Application context: step=${context.step}, form=${JSON.stringify(context.form)}]`
      : message;

    const response = await chatStudent(
      enrichedMessage,
      history ?? [],
      profile
    );

    const saved = await saveChatMessage(profile.id, "assistant", response, "student");

    return NextResponse.json({ response, messageId: saved.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
