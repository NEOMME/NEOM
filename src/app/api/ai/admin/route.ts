import { chatAdmin } from "@/lib/ai";
import { categories, defaultApplications } from "@/lib/data";
import type { Application, UniversityCategory } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history, applications, storeCategories } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apps: Application[] = applications ?? defaultApplications;
    const cats: UniversityCategory[] = storeCategories ?? categories;

    const response = await chatAdmin(message, history ?? [], apps, cats);
    return NextResponse.json({ response });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
