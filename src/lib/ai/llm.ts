import {
  chatCompletion,
  getLLMConfig,
  getProviderChain,
  isLLMAvailable,
  type AIProvider,
} from "./config";
import type { ToolDefinition } from "./tools";

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface LLMResponse {
  content: string | null;
  tool_calls?: ToolCall[];
}

export async function callLLM(
  messages: LLMMessage[],
  tools: ToolDefinition[] = [],
  options?: { jsonMode?: boolean; maxTokens?: number; temperature?: number }
): Promise<LLMResponse | null> {
  if (!isLLMAvailable()) return null;

  for (const provider of getProviderChain()) {
    const result = await callLLMWithProvider(messages, tools, provider, options);
    if (result) return result;
  }

  return null;
}

async function callLLMWithProvider(
  messages: LLMMessage[],
  tools: ToolDefinition[],
  provider: AIProvider,
  options?: { jsonMode?: boolean; maxTokens?: number; temperature?: number }
): Promise<LLMResponse | null> {
  const result = await chatCompletion(
    {
      messages,
      tools: tools.length > 0 ? tools : undefined,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      jsonMode: options?.jsonMode,
    },
    provider
  );

  if (!result) return null;

  return {
    content: result.content,
    tool_calls: result.tool_calls,
  };
}

export async function callLLMText(
  messages: LLMMessage[],
  options?: { jsonMode?: boolean; maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const response = await callLLM(messages, [], options);
  return response?.content ?? null;
}

export { getLLMConfig };
