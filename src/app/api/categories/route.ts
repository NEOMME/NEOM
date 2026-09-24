import { createCategory } from "@/lib/db/queries";
import type { UniversityCategory } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await createCategory(body as UniversityCategory);
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
