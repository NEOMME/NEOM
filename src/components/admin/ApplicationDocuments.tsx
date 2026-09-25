"use client";

import type { ApplicationDocument } from "@/lib/types";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type DocAccess = { url?: string; error?: string; loading: boolean };

function docKey(doc: ApplicationDocument, index: number) {
  return doc.path ?? `${doc.fileName}-${index}`;
}

export function ApplicationDocuments({
  applicationId,
  documents,
}: {
  applicationId: string;
  documents: ApplicationDocument[];
}) {
  const [access, setAccess] = useState<Record<string, DocAccess>>({});

  useEffect(() => {
    let cancelled = false;

    documents.forEach((doc, index) => {
      const key = docKey(doc, index);
      setAccess((prev) => ({ ...prev, [key]: { loading: true } }));

      fetch("/api/documents/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          path: doc.path,
          fileName: doc.fileName,
        }),
      })
        .then(async (res) => {
          const data = (await res.json()) as { url?: string; error?: string };
          if (cancelled) return;
          setAccess((prev) => ({
            ...prev,
            [key]: {
              loading: false,
              url: res.ok ? data.url : undefined,
              error: res.ok ? undefined : (data.error ?? "Unavailable"),
            },
          }));
        })
        .catch(() => {
          if (cancelled) return;
          setAccess((prev) => ({
            ...prev,
            [key]: { loading: false, error: "Failed to load link" },
          }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [applicationId, documents]);

  if (!documents.length) return null;

  return (
    <ul className="space-y-2">
      {documents.map((doc, index) => {
        const key = docKey(doc, index);
        const state = access[key];
        const title = doc.label ? `${doc.label} — ${doc.fileName}` : doc.fileName;

        return (
          <li
            key={key}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <div className="min-w-0 flex-1">
              {doc.label && (
                <span className="block text-xs text-slate-500">{doc.label}</span>
              )}
              <span className="truncate font-medium text-slate-800">{doc.fileName}</span>
              {state?.error && (
                <span className="mt-0.5 block text-xs text-amber-700">{state.error}</span>
              )}
            </div>
            {state?.loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Loading" />
            )}
            {state?.url && !state.loading && (
              <a
                href={state.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                Open
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
