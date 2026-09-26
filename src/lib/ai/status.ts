import {
  getActiveProvider,
  getModel,
  isAIConfigured,
  isLLMAvailable,
  isProviderConfigured,
  type AIProvider,
} from "./config";

export interface AdminAIStatus {
  /** At least one LLM provider env var is set */
  configured: boolean;
  /** Primary provider from env / chain */
  provider: AIProvider | null;
  model: string | null;
  /** Human-readable line for admin UI */
  label: string;
  /** List/stats/research actions work from DB even when this is false */
  llmReachable: boolean;
  groq: boolean;
  qwen: boolean;
  deepseek: boolean;
}

export function getAdminAIStatus(): AdminAIStatus {
  const groq = isProviderConfigured("groq");
  const qwen = isProviderConfigured("qwen");
  const deepseek = isProviderConfigured("deepseek");
  const configured = isAIConfigured();

  if (!configured) {
    return {
      configured: false,
      provider: null,
      model: null,
      label: "Data-only — set GROQ_API_KEY or QWEN_API_URL on Railway",
      llmReachable: false,
      groq,
      qwen,
      deepseek,
    };
  }

  const provider = getActiveProvider();
  const model = getModel(provider);

  return {
    configured: true,
    provider,
    model,
    label: `${provider} (${model})`,
    llmReachable: isLLMAvailable(),
    groq,
    qwen,
    deepseek,
  };
}

/** Old assistant errors saved before data-only fallback existed */
export function isStaleAdminAssistantMessage(content: string): boolean {
  return (
    /Admin AI is unavailable/i.test(content) ||
    /Configure QWEN_API_URL/i.test(content) ||
    /Sorry, I couldn't process that/i.test(content)
  );
}
