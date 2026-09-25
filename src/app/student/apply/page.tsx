"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ApplyPageContent from "./ApplyPageContent";

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      }
    >
      <ApplyPageContent />
    </Suspense>
  );
}
