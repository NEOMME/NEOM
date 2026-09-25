import {
  categories,
  countries,
  NEOM_KNOWLEDGE,
  universities,
} from "./data";

export type AIProvider = "groq" | "deepseek";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildContext() {
  const uniList = universities
    .filter((u) => u.published)
    .map(
      (u) =>
        `- ${u.name} (${countries.find((c) => c.id === u.countryId)?.name}): ${u.programs.join(", ")} | Tuition: ${u.tuition} | Deadline: ${u.deadline}`
    )
    .join("\n");

  const catList = categories
    .map((c) => `- ${c.name}: ${c.description}`)
    .join("\n");

  return `${NEOM_KNOWLEDGE}\n\nCountries: ${countries.map((c) => c.name).join(", ")}\n\nCategories:\n${catList}\n\nPartner Universities:\n${uniList}`;
}

const STUDENT_SYSTEM = `You are Neom AI, a friendly and knowledgeable assistant for the Neom Educational Mobility Platform (NEMP).
Help students understand our services, explore universities, and navigate the application process.
Be clear, encouraging, and specific. Use the context below to give accurate answers.
If asked about something not in context, say so honestly and suggest contacting support@neom.edu.

${buildContext()}`;

async function callGroq(messages: AIMessage[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

async function callDeepSeek(messages: AIMessage[]) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

function getProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "deepseek") return "deepseek";
  return "groq";
}

export async function chatStudent(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const messages: AIMessage[] = [
    { role: "system", content: STUDENT_SYSTEM },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const provider = getProvider();
  const response =
    provider === "deepseek"
      ? await callDeepSeek(messages)
      : await callGroq(messages);

  if (response) return response;
  return fallbackStudentResponse(userMessage);
}

function fallbackStudentResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("who") && (lower.includes("neom") || lower.includes("you"))) {
    return `Neom (NEMP) is your AI-powered gateway to world-class universities. We provide a smooth, step-by-step application process with personalized guidance at every stage. Our platform partners with ${universities.length} leading institutions across ${countries.length} countries. How can I help you start your journey?`;
  }

  if (lower.includes("step") || lower.includes("process") || lower.includes("apply")) {
    return `Our application process has 6 clear steps:\n\n1. **Profile** — Personal details\n2. **Destination** — Choose country & university\n3. **Academic** — Your education history\n4. **Programs** — Select your degree\n5. **Documents** — Upload required files\n6. **Review & Submit** — Final check\n\nEach step saves automatically. Ready to start? Head to the Apply section in your dashboard!`;
  }

  if (lower.includes("universit") || lower.includes("school")) {
    const published = universities.filter((u) => u.published);
    const list = published
      .slice(0, 5)
      .map((u) => {
        const country = countries.find((c) => c.id === u.countryId);
        return `• **${u.name}** (${country?.flag} ${country?.name}) — ${u.programs.slice(0, 3).join(", ")}`;
      })
      .join("\n");
    return `We partner with ${published.length} universities worldwide. Here are some highlights:\n\n${list}\n\nWould you like details on a specific country or program?`;
  }

  if (lower.includes("countr")) {
    const list = countries.map((c) => `${c.flag} **${c.name}**`).join("\n");
    return `You can apply to universities in these countries:\n\n${list}\n\nWhich country interests you most? I can recommend universities there.`;
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

  return `I'm Neom AI, here to help you navigate your university application journey! I can tell you about:\n\n• Our services and application process\n• Partner universities and countries\n• Program categories and deadlines\n• Step-by-step application guidance\n\nWhat would you like to know? (Tip: Connect a Groq or DeepSeek API key for full AI capabilities.)`;
}
