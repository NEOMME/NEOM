import type { ApplicationDocument } from "@/lib/types";

export function normalizeApplicationDocuments(raw: unknown): ApplicationDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      return { fileName: item };
    }
    if (item && typeof item === "object" && "fileName" in item) {
      const doc = item as ApplicationDocument;
      return {
        label: doc.label,
        fileName: doc.fileName,
        path: doc.path,
        url: doc.url,
      };
    }
    return { fileName: String(item) };
  });
}

export async function findApplicationDocumentPath(
  studentId: string,
  applicationId: string,
  fileName: string,
  listFolder: (folder: string) => Promise<{ name: string }[] | null>
): Promise<string | null> {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const folders = [
    `${studentId}/${applicationId}`,
    `${studentId}/drafts`,
    studentId,
  ];

  for (const folder of folders) {
    const entries = await listFolder(folder);
    if (!entries?.length) continue;
    const match = entries.find(
      (f) =>
        f.name === fileName ||
        f.name === safe ||
        f.name.endsWith(`-${safe}`) ||
        f.name.endsWith(`-${fileName}`)
    );
    if (match) return `${folder}/${match.name}`;
  }

  return null;
}
