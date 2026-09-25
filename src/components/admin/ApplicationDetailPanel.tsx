"use client";

import type { Application } from "@/lib/types";

function Field({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200">{value}</dd>
    </div>
  );
}

export function ApplicationDetailPanel({ app }: { app: Application }) {
  const { personalInfo, academicInfo } = app;

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 grid sm:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Student contact
        </h4>
        <dl className="space-y-2">
          <Field label="Email" value={app.studentEmail} />
          <Field label="Full name (form)" value={personalInfo.fullName} />
          <Field label="Phone" value={personalInfo.phone} />
          <Field label="Date of birth" value={personalInfo.dateOfBirth} />
          <Field label="Nationality" value={personalInfo.nationality} />
        </dl>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Academic
        </h4>
        <dl className="space-y-2">
          <Field label="Degree" value={academicInfo.degree} />
          <Field label="GPA" value={academicInfo.gpa} />
          <Field label="Institution" value={academicInfo.institution} />
          <Field label="Graduation year" value={academicInfo.graduationYear} />
        </dl>
      </div>
      {(app.documents.length > 0 || app.notes?.trim()) && (
        <div className="sm:col-span-2">
          {app.documents.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Documents
              </h4>
              <ul className="text-sm text-slate-300 list-disc list-inside">
                {app.documents.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
          {app.notes?.trim() && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Notes
              </h4>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{app.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
