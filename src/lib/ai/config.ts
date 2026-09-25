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

  const body: Record<string, unknown> = {
    model: getModel(provider),
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
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
    const choice = data.choices?.[0]?.message;
    if (!choice) return null;

    return {
      content: choice.content ?? null,
      tool_calls: choice.tool_calls,
    };
  } catch (err) {
    console.error(`[AI:${provider}] request failed`, err);
    return null;
  }
}
