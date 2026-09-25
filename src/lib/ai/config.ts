export type AIProvider = "qwen" | "groq" | "deepseek";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ChatCompletionResult {
  content: string | null;
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Preferred provider from env; defaults to Qwen when QWEN_API_URL is set. */
export function getActiveProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "qwen" || explicit === "groq" || explicit === "deepseek") {
    return explicit;
  }
  if (process.env.QWEN_API_URL) return "qwen";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  return "groq";
}

/** Providers to try in order (primary first, then fallbacks). */
export function getProviderChain(): AIProvider[] {
  const primary = getActiveProvider();
  const chain: AIProvider[] = [primary];

  for (const p of ["qwen", "groq", "deepseek"] as AIProvider[]) {
    if (p !== primary && isProviderConfigured(p)) chain.push(p);
  }

  return chain;
}

export function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case "qwen":
      return Boolean(process.env.QWEN_API_URL);
    case "deepseek":
      return Boolean(process.env.DEEPSEEK_API_KEY);
    default:
      return Boolean(process.env.GROQ_API_KEY);
  }
}

export function isAIConfigured(): boolean {
  return getProviderChain().length > 0;
}

export function getModel(provider: AIProvider): string {
  switch (provider) {
    case "qwen":
      return process.env.QWEN_MODEL ?? "smollm:135m";
    case "deepseek":
      return process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    default:
      return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  }
}

export function getChatCompletionsUrl(provider: AIProvider): string {
  switch (provider) {
    case "qwen": {
      const base = process.env.QWEN_API_URL;
      if (!base) throw new Error("QWEN_API_URL is not configured");
      const normalized = normalizeBaseUrl(base);
      if (normalized.endsWith("/chat/completions")) return normalized;
      if (normalized.endsWith("/v1")) return `${normalized}/chat/completions`;
      return `${normalized}/v1/chat/completions`;
    }
    case "deepseek":
      return "https://api.deepseek.com/chat/completions";
    default:
      return "https://api.groq.com/openai/v1/chat/completions";
  }
}

function getAuthHeaders(provider: AIProvider): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider === "qwen") {
    const key = process.env.QWEN_API_KEY;
    if (key) headers.Authorization = `Bearer ${key}`;
    return headers;
  }

  const apiKey =
    provider === "deepseek"
      ? process.env.DEEPSEEK_API_KEY
      : process.env.GROQ_API_KEY;

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

export interface LLMConfig {
  provider: AIProvider;
  model: string;
  chatUrl: string;
  apiKey?: string;
}

export function isLLMAvailable(): boolean {
  return isAIConfigured();
}

/** Tiny local models (e.g. Ollama smollm) cannot use tools or large prompts reliably. */
export function isSmallLocalModel(provider: AIProvider = getActiveProvider()): boolean {
  if (provider !== "qwen") return false;
  const model = (process.env.QWEN_MODEL ?? "smollm:135m").toLowerCase();
  return (
    model.includes("smollm") ||
    model.includes("135m") ||
    model.includes(":1b") ||
    model.includes(":3b") ||
    model.includes("tiny")
  );
}

export function supportsFunctionCalling(provider: AIProvider = getActiveProvider()): boolean {
  if (provider === "groq" || provider === "deepseek") return true;
  if (provider === "qwen") return !isSmallLocalModel(provider);
  return false;
}

export function getMaxContextChars(provider: AIProvider = getActiveProvider()): number {
  if (isSmallLocalModel(provider)) return 4000;
  return 14000;
}

export function getLLMGenerationOptions(provider: AIProvider = getActiveProvider()) {
  return {
    maxTokens: isSmallLocalModel(provider) ? 512 : 2048,
    temperature: isSmallLocalModel(provider) ? 0.4 : 0.7,
  };
}

export function getLLMConfig(provider: AIProvider = getActiveProvider()): LLMConfig {
  const apiKey =
    provider === "qwen"
      ? process.env.QWEN_API_KEY
      : provider === "deepseek"
        ? process.env.DEEPSEEK_API_KEY
        : process.env.GROQ_API_KEY;

  return {
    provider,
    model: getModel(provider),
    chatUrl: getChatCompletionsUrl(provider),
    apiKey: apiKey || undefined,
  };
}

export async function chatCompletion(
  options: ChatCompletionOptions,
  provider?: AIProvider
): Promise<ChatCompletionResult | null> {
  const providers = provider ? [provider] : getProviderChain();
  if (providers.length === 0) return null;

  for (const p of providers) {
    const result = await chatCompletionOnce(options, p);
    if (result) return result;
  }

  return null;
}

async function chatCompletionOnce(
  options: ChatCompletionOptions,
  provider: AIProvider
): Promise<ChatCompletionResult | null> {
  if (!isProviderConfigured(provider)) return null;

  const gen = getLLMGenerationOptions(provider);
  const apiMessages =
    options.tools?.length
      ? options.messages
      : options.messages.filter((m) => m.role === "system" || m.role === "user" || m.role === "assistant");

  const body: Record<string, unknown> = {
    model: getModel(provider),
    messages: apiMessages,
    temperature: options.temperature ?? gen.temperature,
    max_tokens: options.maxTokens ?? gen.maxTokens,
  };

  if (options.tools?.length) {
    body.tools = options.tools;
    body.tool_choice = "auto";
  }

  if (options.jsonMode && provider !== "groq") {
    body.response_format = { type: "json_object" };
  }

  try {
    const res = await fetch(getChatCompletionsUrl(provider), {
      method: "POST",
      headers: getAuthHeaders(provider),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[AI:${provider}] ${res.status} ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const message = choice?.message ?? choice;
    if (!message) return null;

    let content: string | null =
      typeof message.content === "string" ? message.content : message.content ?? null;
    if (!content?.trim() && typeof message.reasoning === "string") {
      content = message.reasoning;
    }
    if (!content?.trim() && typeof data.message?.content === "string") {
      content = data.message.content;
    }

    return {
      content: content?.trim() ? content : null,
      tool_calls: message.tool_calls,
    };
  } catch (err) {
    console.error(`[AI:${provider}] request failed`, err);
    return null;
  }
}
