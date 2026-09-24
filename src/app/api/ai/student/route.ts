import { chatStudent } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await chatStudent(message, history ?? []);
    return NextResponse.json({ response });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
