import type { User } from "./types";
import { runAgent } from "./ai/agent";
import { buildLiveContext, buildStudentSystemPrompt } from "./ai/context";
import { fetchPlatformData } from "./db/queries";
import {
  categories,
  countries,
  NEOM_KNOWLEDGE,
  universities,
} from "./data";

export type { AIProvider } from "./ai/config";
export { getActiveProvider, isAIConfigured, isLLMAvailable } from "./ai/config";

export async function chatStudent(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[],
  profile: User
): Promise<string> {
  try {
    const { contextText } = await buildLiveContext(profile);
    const systemPrompt = buildStudentSystemPrompt(contextText);

    return runAgent({
      systemPrompt,
      userMessage,
      history,
      profile,
      agentType: "student",
      fallback: (msg) => fallbackStudentResponse(msg),
    });
  } catch {
    return fallbackStudentResponse(userMessage);
  }
}

export async function chatAdmin(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[],
  profile: User
): Promise<string> {
  const { buildAdminSystemPrompt } = await import("./ai/context");
  const data = await fetchPlatformData();
  const contextText = `Platform overview:
- ${data.universities.length} universities (${data.universities.filter((u) => u.published).length} published)
- ${data.countries.length} countries, ${data.categories.length} categories`;

  return runAgent({
    systemPrompt: buildAdminSystemPrompt(contextText),
    userMessage,
    history,
    profile,
    agentType: "admin",
    fallback: () =>
      "Admin AI is unavailable. Check that your LLM is running (QWEN_API_URL on Railway Qwen3, or set GROQ_API_KEY / DEEPSEEK_API_KEY as fallback).",
  });
}

function fallbackStudentResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("who") && (lower.includes("neom") || lower.includes("you"))) {
    return `Neom (NEMP) is your AI-powered gateway to world-class universities. We provide a smooth, step-by-step application process with personalized guidance at every stage. Our platform partners with ${universities.length} leading institutions across ${countries.length} countries. How can I help you start your journey?`;
  }

  if (lower.includes("step") || lower.includes("process") || lower.includes("apply")) {
    return `Our application process has 6 clear steps:\n\n1. **Profile** — Personal details\n2. **Destination** — Choose country & university\n3. **Academic** — Your education history\n4. **Programs** — Select your degree\n5. **Documents** — Upload required files\n6. **Review & Submit** — Final check\n\nEach step saves automatically. Ready to start? Head to the Apply section in your dashboard!`;
  }

  if (lower.includes("universit") || lower.includes("school") || lower.includes("recommend")) {
    const published = universities.filter((u) => u.published);
    const list = published
      .slice(0, 5)
      .map((u) => {
        const country = countries.find((c) => c.id === u.countryId);
        return `• **${u.name}** (${country?.flag} ${country?.name}) — ${u.programs.slice(0, 3).join(", ")}`;
      })
      .join("\n");
    return `We partner with ${published.length} universities worldwide. Here are some highlights:\n\n${list}\n\nWould you like details on a specific country or program? (Connect an API key for personalized recommendations.)`;
  }

  if (lower.includes("countr")) {
    const list = countries.map((c) => `${c.flag} **${c.name}**`).join("\n");
    return `You can apply to universities in these countries:\n\n${list}\n\nWhich country interests you most?`;
  }

  if (lower.includes("categor") || lower.includes("field") || lower.includes("program")) {
    const list = categories
      .map((c) => `• **${c.name}** — ${c.description}`)
      .join("\n");
    return `We organize universities into these categories:\n\n${list}\n\nTell me your field of interest and I'll suggest matching universities!`;
  }

  if (lower.includes("deadline") || lower.includes("when")) {
    const upcoming = universities
      .filter((u) => u.published)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 3)
      .map((u) => `• ${u.name}: **${u.deadline}**`)
      .join("\n");
    return `Upcoming application deadlines:\n\n${upcoming}\n\nI recommend starting early — our 6-step process is designed to be smooth and stress-free!`;
  }

  return `I'm Neom AI, here to help you navigate your university application journey! I can tell you about:\n\n• Our services and application process\n• Partner universities and countries\n• Program categories and deadlines\n• Personalized recommendations\n\nWhat would you like to know? (Tip: Configure QWEN_API_URL on Railway for full AI capabilities.)\n\n${NEOM_KNOWLEDGE.slice(0, 200)}...`;
}
