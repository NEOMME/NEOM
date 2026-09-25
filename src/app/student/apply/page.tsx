"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { APPLICATION_STEPS } from "@/lib/data";
import { useNeomStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const STEP_IDS = APPLICATION_STEPS.map((s) => s.id);

export default function ApplyPage() {
  const { countries, universities, categories, currentStudent, addApplication } =
    useNeomStore();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    phone: "",
    countryId: "",
    universityId: "",
    degree: "",
    gpa: "",
    institution: "",
    graduationYear: "",
    program: "",
    documents: [] as string[],
  });

  useEffect(() => {
    if (!currentStudent) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || currentStudent.name,
      nationality: f.nationality || currentStudent.country || "",
    }));
  }, [currentStudent]);

  const update = (field: string, value: string | string[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const filteredUniversities = universities.filter(
    (u) => u.published && (!form.countryId || u.countryId === form.countryId)
  );

  const canNext = () => {
    switch (STEP_IDS[step]) {
      case "profile":
        return form.fullName && form.dateOfBirth && form.nationality && form.phone;
      case "destination":
        return form.countryId && form.universityId;
      case "academic":
        return form.degree && form.gpa && form.institution && form.graduationYear;
      case "programs":
        return !!form.program;
      case "documents":
        return form.documents.length >= 1;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!currentStudent) {
      setSubmitError("Your profile is still loading. Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const result = await addApplication({
      studentId: currentStudent.id,
      universityId: form.universityId,
      status: "submitted",
      steps: APPLICATION_STEPS.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        completed: true,
      })),
      personalInfo: {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
        phone: form.phone,
      },
      academicInfo: {
        degree: form.degree,
        gpa: form.gpa,
        institution: form.institution,
        graduationYear: form.graduationYear,
      },
      documents: form.documents,
      notes: `Program: ${form.program}`,
    });

    setSubmitting(false);

    if (!result) {
      setSubmitError("Failed to submit your application. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex items-center justify-center min-h-[80vh]">
        <Card className="text-center w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-slate-600 mb-6">
            Your application has been sent successfully. You can track its progress on your dashboard.
          </p>
          <Link href="/student">
            <Button>Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/student" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">University Application</h1>
        <p className="text-slate-600">Complete all 6 steps to submit your application.</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {APPLICATION_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                i < step
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                  : i === step
                    ? "bg-blue-50 text-blue-700 border border-blue-300"
                    : "bg-white text-slate-400 border border-slate-200"
              )}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            {i < APPLICATION_STEPS.length - 1 && (
              <div className={cn("w-8 h-px", i < step ? "bg-emerald-300" : "bg-slate-200")} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {APPLICATION_STEPS[step].title}
            </h2>
            <p className="text-sm text-slate-600 mb-6">{APPLICATION_STEPS[step].description}</p>

            {STEP_IDS[step] === "profile" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={form.fullName} onChange={(v) => update("fullName", v)} />
                <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} />
                <Field label="Nationality" value={form.nationality} onChange={(v) => update("nationality", v)} />
                <Field label="Phone Number" value={form.phone} onChange={(v) => update("phone", v)} />
              </div>
            )}

            {STEP_IDS[step] === "destination" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Select Country</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {countries.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          update("countryId", c.id);
                          update("universityId", "");
                        }}
                        className={cn(
                          "p-3 rounded-xl text-left text-sm transition-all border",
                          form.countryId === c.id
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        )}
                      >
                        {c.flag} {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                {form.countryId && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Select University</label>
                    <div className="space-y-2">
                      {filteredUniversities.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => update("universityId", u.id)}
                          className={cn(
                            "w-full p-4 rounded-xl text-left transition-all border",
                            form.universityId === u.id
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                        >
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{u.tuition} · Deadline: {u.deadline}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {STEP_IDS[step] === "academic" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Current/Highest Degree" value={form.degree} onChange={(v) => update("degree", v)} />
                <Field label="GPA / Grade" value={form.gpa} onChange={(v) => update("gpa", v)} />
                <Field label="Institution" value={form.institution} onChange={(v) => update("institution", v)} />
                <Field label="Graduation Year" value={form.graduationYear} onChange={(v) => update("graduationYear", v)} />
              </div>
            )}

            {STEP_IDS[step] === "programs" && (
              <div>
                <label className="block text-sm text-slate-400 mb-2">Select Program</label>
                <div className="space-y-2">
                  {(universities.find((u) => u.id === form.universityId)?.programs ?? []).map((p) => (
                    <button
                      key={p}
                      onClick={() => update("program", p)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left text-sm transition-all border",
                        form.program === p
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {STEP_IDS[step] === "documents" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Mark each required document as uploaded:</p>
                {["Transcript", "Passport / ID", "Recommendation Letter"].map((doc) => {
                  const key = doc.toLowerCase().replace(/[^a-z]/g, "") + ".pdf";
                  const uploaded = form.documents.includes(key);
                  return (
                    <button
                      key={doc}
                      onClick={() => {
                        if (!uploaded) update("documents", [...form.documents, key]);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                        uploaded
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-blue-200"
                      )}
                    >
                      <span className="text-sm text-slate-900">{doc}</span>
                      {uploaded ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {STEP_IDS[step] === "review" && (
              <div className="space-y-4 text-sm">
                {[
                  ["Name", form.fullName],
                  ["University", universities.find((u) => u.id === form.universityId)?.name],
                  ["Country", countries.find((c) => c.id === form.countryId)?.name],
                  ["Program", form.program],
                  ["Degree", form.degree],
                  ["GPA", form.gpa],
                  ["Documents", form.documents.join(", ")],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-6">
            {submitError}
          </p>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {step < APPLICATION_STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canNext() || submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
