import {
  approveStagingUniversity,
  rejectStagingUniversity,
  runUniversityResearch,
} from "@/lib/ai/research";
import { APPLICATION_STEPS } from "@/lib/data";
import {
  createApplication,
  createCategory,
  createEmailCampaign,
  createNotification,
  createPromotion,
  createUniversity,
  deleteApplication,
  deleteCategory,
  deleteEmailCampaign,
  deletePromotion,
  deleteStagingEntry,
  deleteUniversity,
  fetchAdminData,
  fetchPlatformData,
  getApplicationById,
  searchUniversities,
  toggleUniversityPublished,
  updateApplicationFull,
  updateUniversity,
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
  {
    type: "function",
    function: {
      name: "start_draft_application",
      description: "Create a new draft application for the current student at a university",
      parameters: {
        type: "object",
        properties: {
          universityId: { type: "string" },
          programNotes: { type: "string", description: "Optional program interest notes" },
        },
        required: ["universityId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_my_draft_application",
      description: "Delete one of the student's draft applications (draft status only)",
      parameters: {
        type: "object",
        properties: {
          applicationId: { type: "string" },
        },
        required: ["applicationId"],
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
  {
    type: "function",
    function: {
      name: "add_university",
      description: "Add a new partner university to the catalog",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          countryId: { type: "string" },
          description: { type: "string" },
          tuition: { type: "string" },
          ranking: { type: "number" },
          programs: { type: "array", items: { type: "string" } },
          deadline: { type: "string" },
          published: { type: "boolean" },
          categoryIds: { type: "array", items: { type: "string" } },
        },
        required: ["name", "countryId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_university",
      description: "Update an existing university's fields",
      parameters: {
        type: "object",
        properties: {
          universityId: { type: "string" },
          name: { type: "string" },
          countryId: { type: "string" },
          description: { type: "string" },
          tuition: { type: "string" },
          ranking: { type: "number" },
          programs: { type: "array", items: { type: "string" } },
          deadline: { type: "string" },
          published: { type: "boolean" },
        },
        required: ["universityId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_university",
      description: "Permanently delete a university (fails if applications exist)",
      parameters: {
        type: "object",
        properties: { universityId: { type: "string" } },
        required: ["universityId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_application",
      description: "Permanently delete a student application record",
      parameters: {
        type: "object",
        properties: { applicationId: { type: "string" } },
        required: ["applicationId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_staging_entry",
      description: "Permanently remove a row from universities_staging",
      parameters: {
        type: "object",
        properties: { stagingId: { type: "string" } },
        required: ["stagingId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_category",
      description: "Add an academic category",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "Slug id e.g. eng-tech" },
          name: { type: "string" },
          description: { type: "string" },
          icon: { type: "string" },
          color: { type: "string" },
        },
        required: ["id", "name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_category",
      description: "Delete a category by id",
      parameters: {
        type: "object",
        properties: { categoryId: { type: "string" } },
        required: ["categoryId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_promotion",
      description: "Create a marketing promotion",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          discount: { type: "string" },
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
          active: { type: "boolean" },
        },
        required: ["title", "startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_promotion",
      description: "Delete a promotion by id",
      parameters: {
        type: "object",
        properties: { promotionId: { type: "string" } },
        required: ["promotionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_email_campaign",
      description: "Delete an email campaign by id",
      parameters: {
        type: "object",
        properties: { campaignId: { type: "string" } },
        required: ["campaignId"],
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

    case "start_draft_application": {
      const universityId = args.universityId as string;
      const uni = data.universities.find((u) => u.id === universityId);
      if (!uni) return `University "${universityId}" not found.`;
      const app = await createApplication({
        studentId: profile.id,
        universityId,
        status: "draft",
        steps: APPLICATION_STEPS.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          completed: false,
        })),
        personalInfo: {
          fullName: profile.name,
          dateOfBirth: "",
          nationality: profile.country ?? "",
          phone: "",
        },
        academicInfo: {
          degree: "",
          gpa: "",
          institution: "",
          graduationYear: "",
        },
        documents: [],
        notes: (args.programNotes as string) ?? "",
      });
      return `Created draft application id=${app.id} for ${uni.name}. Continue at /student/apply?draft=${app.id}`;
    }

    case "delete_my_draft_application": {
      const app = await getApplicationById(args.applicationId as string, profile.id);
      if (!app) return "Application not found or not yours.";
      if (app.status !== "draft") {
        return "Only draft applications can be deleted. Submitted applications cannot be removed by students.";
      }
      await deleteApplication(app.id);
      return `Deleted draft application ${app.id}.`;
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

    case "add_university": {
      const id = await createUniversity({
        name: args.name as string,
        countryId: args.countryId as string,
        description: args.description as string | undefined,
        tuition: args.tuition as string | undefined,
        ranking: args.ranking as number | undefined,
        programs: args.programs as string[] | undefined,
        deadline: args.deadline as string | undefined,
        published: args.published as boolean | undefined,
        categoryIds: args.categoryIds as string[] | undefined,
      });
      await createNotification({
        type: "catalog_update",
        title: "University added",
        body: `${args.name} added to catalog (id: ${id})`,
        metadata: { universityId: id },
      });
      return `Added university "${args.name}" with id=${id}.`;
    }

    case "update_university": {
      const universityId = args.universityId as string;
      await updateUniversity(universityId, {
        name: args.name as string | undefined,
        countryId: args.countryId as string | undefined,
        description: args.description as string | undefined,
        tuition: args.tuition as string | undefined,
        ranking: args.ranking as number | undefined,
        programs: args.programs as string[] | undefined,
        deadline: args.deadline as string | undefined,
        published: args.published as boolean | undefined,
      });
      return `Updated university ${universityId}.`;
    }

    case "delete_university": {
      try {
        await deleteUniversity(args.universityId as string);
        return `Deleted university ${args.universityId}.`;
      } catch (e) {
        return e instanceof Error ? e.message : "Delete failed.";
      }
    }

    case "delete_application": {
      await deleteApplication(args.applicationId as string);
      return `Deleted application ${args.applicationId}.`;
    }

    case "delete_staging_entry": {
      await deleteStagingEntry(args.stagingId as string);
      return `Deleted staging entry ${args.stagingId}.`;
    }

    case "add_category": {
      await createCategory({
        id: args.id as string,
        name: args.name as string,
        description: (args.description as string) ?? "",
        icon: (args.icon as string) ?? "Tag",
        color: (args.color as string) ?? "#06b6d4",
      });
      return `Added category ${args.id}: ${args.name}`;
    }

    case "delete_category": {
      try {
        await deleteCategory(args.categoryId as string);
        return `Deleted category ${args.categoryId}.`;
      } catch (e) {
        return e instanceof Error ? e.message : "Delete failed (may be in use).";
      }
    }

    case "add_promotion": {
      const promo = await createPromotion({
        title: args.title as string,
        description: args.description as string | undefined,
        discount: args.discount as string | undefined,
        startDate: args.startDate as string,
        endDate: args.endDate as string,
        active: args.active as boolean | undefined,
      });
      return `Created promotion id=${promo.id}: ${promo.title}`;
    }

    case "delete_promotion": {
      await deletePromotion(args.promotionId as string);
      return `Deleted promotion ${args.promotionId}.`;
    }

    case "delete_email_campaign": {
      await deleteEmailCampaign(args.campaignId as string);
      return `Deleted email campaign ${args.campaignId}.`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
