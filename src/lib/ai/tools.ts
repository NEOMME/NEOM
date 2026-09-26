import {
  approveStagingUniversity,
  rejectStagingUniversity,
  runUniversityResearch,
} from "@/lib/ai/research";
import {
  createEmailCampaign,
  createNotification,
  fetchAdminData,
  fetchPlatformData,
  searchUniversities,
  toggleUniversityPublished,
  updateApplicationFull,
} from "@/lib/db/queries";
import type { User } from "@/lib/types";
import {
  recommendUniversities,
  summarizeRecommendations,
} from "./recommendations";

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const STUDENT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_universities",
      description: "Search partner universities by country, category, program keyword, or max tuition",
      parameters: {
        type: "object",
        properties: {
          countryId: { type: "string", description: "Country ID e.g. uk, us, de" },
          categoryId: { type: "string", description: "Category ID e.g. eng-tech" },
          programKeyword: { type: "string", description: "Search programs by keyword" },
          maxTuition: { type: "number", description: "Maximum tuition per year in USD" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend_universities",
      description: "Get personalized university recommendations based on student profile and preferences",
      parameters: {
        type: "object",
        properties: {
          gpa: { type: "string", description: "Student GPA e.g. 3.5" },
          categoryId: { type: "string", description: "Preferred field category ID" },
          countryId: { type: "string", description: "Preferred country ID" },
          maxTuition: { type: "number", description: "Budget limit in USD" },
          interests: { type: "string", description: "Program interests e.g. computer science" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_applications",
      description: "Get the current student's applications and their status",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_university_details",
      description: "Get detailed information about a specific university by ID",
      parameters: {
        type: "object",
        properties: {
          universityId: { type: "string", description: "University ID" },
        },
        required: ["universityId"],
      },
    },
  },
];

export const ADMIN_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "list_applications",
      description: "List all student applications, optionally filtered by status",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["draft", "submitted", "under_review", "accepted", "rejected"],
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_staging_universities",
      description: "List universities pending review from research pipeline",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_application_status",
      description: "Update an application status (admin action)",
      parameters: {
        type: "object",
        properties: {
          applicationId: { type: "string" },
          status: {
            type: "string",
            enum: ["under_review", "accepted", "rejected"],
          },
        },
        required: ["applicationId", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_platform_stats",
      description: "Get platform statistics: applications, universities, pending research",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "run_university_research",
      description:
        "Run web/LLM research to discover universities and add them to the staging queue for admin review",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "What to research e.g. top CS universities in Germany" },
          countryId: { type: "string", description: "Optional country id e.g. de, uk" },
          categoryId: { type: "string", description: "Optional category id" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_email",
      description: "Draft an email campaign for students (preview only, not saved)",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          purpose: { type: "string", description: "What the email should communicate" },
        },
        required: ["purpose"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "approve_staging_university",
      description: "Approve a researched university from staging and add it to the catalog (unpublished until you publish)",
      parameters: {
        type: "object",
        properties: {
          stagingId: { type: "string", description: "UUID from list_staging_universities" },
        },
        required: ["stagingId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reject_staging_university",
      description: "Reject a staging university research entry",
      parameters: {
        type: "object",
        properties: {
          stagingId: { type: "string" },
        },
        required: ["stagingId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_university_published",
      description: "Publish or unpublish a partner university on the student portal",
      parameters: {
        type: "object",
        properties: {
          universityId: { type: "string" },
          published: { type: "boolean" },
        },
        required: ["universityId", "published"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_email_campaign",
      description: "Save an email campaign draft to the database",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
        },
        required: ["subject", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_universities",
      description: "List partner universities with publish status",
      parameters: {
        type: "object",
        properties: {
          publishedOnly: { type: "boolean" },
        },
      },
    },
  },
];

export async function executeStudentTool(
  name: string,
  args: Record<string, unknown>,
  profile: User
): Promise<string> {
  const data = await fetchPlatformData(profile.id);

  switch (name) {
    case "search_universities": {
      const results = searchUniversities(data.universities, data.countries, {
        countryId: args.countryId as string | undefined,
        categoryId: args.categoryId as string | undefined,
        programKeyword: args.programKeyword as string | undefined,
        maxTuition: args.maxTuition as number | undefined,
        publishedOnly: true,
      });
      if (results.length === 0) return "No universities matched your search.";
      return results
        .slice(0, 8)
        .map(
          (u) => {
            const country = data.countries.find((c) => c.id === u.countryId);
            return `• ${u.name} (${country?.name}) — id: ${u.id}\n  Programs: ${u.programs.join(", ")}\n  Tuition: ${u.tuition} | Deadline: ${u.deadline}`;
          }
        )
        .join("\n\n");
    }

    case "recommend_universities": {
      const recs = recommendUniversities(
        data.universities,
        data.categories,
        profile,
        {
          gpa: args.gpa as string | undefined,
          categoryId: args.categoryId as string | undefined,
          countryId: args.countryId as string | undefined,
          maxTuition: args.maxTuition as number | undefined,
          interests: args.interests as string | undefined,
        }
      );
      return summarizeRecommendations(recs);
    }

    case "get_my_applications": {
      const apps = data.applications.filter((a) => a.studentId === profile.id);
      if (apps.length === 0) return "You have no applications yet. Start one at /student/apply";
      return apps
        .map(
          (a) =>
            `• ${a.universityName} (${a.countryName})\n  Status: ${a.status} | ID: ${a.id}\n  Updated: ${a.updatedAt}\n  Notes: ${a.notes || "none"}`
        )
        .join("\n\n");
    }

    case "get_university_details": {
      const uni = data.universities.find((u) => u.id === args.universityId);
      if (!uni) return `University "${args.universityId}" not found.`;
      const country = data.countries.find((c) => c.id === uni.countryId);
      const cats = uni.categoryIds
        .map((id) => data.categories.find((c) => c.id === id)?.name)
        .filter(Boolean);
      return `${uni.name} (${country?.name ?? "Unknown"})
Description: ${uni.description}
Programs: ${uni.programs.join(", ")}
Tuition: ${uni.tuition}
Ranking: #${uni.ranking}
Deadline: ${uni.deadline}
Categories: ${cats.join(", ")}`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

export async function executeAdminTool(
  name: string,
  args: Record<string, unknown>,
  profile: User
): Promise<string> {
  const data = await fetchAdminData();

  switch (name) {
    case "list_applications": {
      let apps = data.applications;
      if (args.status) {
        apps = apps.filter((a) => a.status === args.status);
      }
      if (apps.length === 0) return "No applications found.";
      return apps
        .slice(0, 15)
        .map(
          (a) =>
            `• ${a.studentName} → ${a.universityName} | ${a.status} | id: ${a.id}`
        )
        .join("\n");
    }

    case "list_staging_universities": {
      const status = (args.status as string) ?? "pending";
      const staging = data.staging.filter((s) => s.status === status);
      if (staging.length === 0) return `No ${status} staging entries.`;
      return staging
        .map(
          (s) =>
            `• ${s.name} (${s.countryId ?? "unknown country"}) — ${s.status}\n  Programs: ${s.programs.join(", ")}\n  Source: ${s.sourceUrl ?? "N/A"}\n  id: ${s.id}`
        )
        .join("\n\n");
    }

    case "update_application_status": {
      const app = await updateApplicationFull(
        args.applicationId as string,
        { status: args.status as "under_review" | "accepted" | "rejected" }
      );
      await createNotification({
        type: "application_status",
        title: `Application ${args.status}`,
        body: `${app.studentName}'s application to ${app.universityName} is now ${args.status}`,
        metadata: { applicationId: app.id, status: args.status },
      });
      return `Updated application ${app.id} to status: ${args.status}`;
    }

    case "get_platform_stats": {
      const pending = data.staging.filter((s) => s.status === "pending").length;
      const submitted = data.applications.filter((a) => a.status === "submitted").length;
      const unread = data.notifications.filter((n) => !n.read).length;
      return `Platform Stats:
- Universities: ${data.universities.length} (${data.universities.filter((u) => u.published).length} published)
- Applications: ${data.applications.length} (${submitted} submitted)
- Pending research: ${pending}
- Unread notifications: ${unread}
- Students: ${data.users.length}
- Active promotions: ${data.promotions.filter((p) => p.active).length}`;
    }

    case "run_university_research": {
      const query = args.query as string;
      if (!query?.trim()) return "Research query is required.";
      const results = await runUniversityResearch(
        {
          query: query.trim(),
          countryId: args.countryId as string | undefined,
          categoryId: args.categoryId as string | undefined,
        },
        profile
      );
      if (results.length === 0) {
        return `No universities extracted for "${query}". Try Admin → Research or set TAVILY_API_KEY.`;
      }
      return results
        .map(
          (r) =>
            `• ${r.name} (staging id: ${r.id}) — ${r.programs.slice(0, 3).join(", ")} | status: ${r.status}`
        )
        .join("\n");
    }

    case "draft_email": {
      const subject = (args.subject as string) ?? "Update from Neom";
      const purpose = args.purpose as string;
      return `Email Draft:
Subject: ${subject}

Dear Student,

${purpose}

We are here to support you throughout your application journey. Log in to your Neom dashboard to track progress and get AI-powered guidance.

Best regards,
The Neom Team

---
Use save_email_campaign to persist this draft.`;
    }

    case "approve_staging_university": {
      const { universityId } = await approveStagingUniversity(
        args.stagingId as string,
        profile
      );
      return `Approved staging entry. New university id: ${universityId} (published=false). Use set_university_published to make it visible to students.`;
    }

    case "reject_staging_university": {
      await rejectStagingUniversity(args.stagingId as string, profile);
      return `Rejected staging entry ${args.stagingId}.`;
    }

    case "set_university_published": {
      const id = args.universityId as string;
      const published = Boolean(args.published);
      await toggleUniversityPublished(id, published);
      const uni = data.universities.find((u) => u.id === id);
      return `${uni?.name ?? id} is now ${published ? "published" : "unpublished"}.`;
    }

    case "save_email_campaign": {
      const row = await createEmailCampaign({
        subject: args.subject as string,
        body: args.body as string,
        status: "draft",
      });
      return `Saved email campaign draft id=${row.id}, subject="${row.subject}".`;
    }

    case "list_universities": {
      let unis = data.universities;
      if (args.publishedOnly) unis = unis.filter((u) => u.published);
      if (unis.length === 0) return "No universities found.";
      return unis
        .slice(0, 20)
        .map(
          (u) =>
            `• ${u.name} (id: ${u.id}) — ${u.published ? "published" : "hidden"} | ${u.tuition}`
        )
        .join("\n");
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
