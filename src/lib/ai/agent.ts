import type { User } from "@/lib/types";
import { getActiveProvider } from "./config";
import { callLLM } from "./llm";
import {
  ADMIN_TOOLS,
  executeAdminTool,
  executeStudentTool,
  STUDENT_TOOLS,
} from "./tools";

export type { AIProvider } from "./config";
export type AgentType = "student" | "admin";

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
}

const MAX_TOOL_ROUNDS = 5;

export async function runAgent(params: {
  systemPrompt: string;
  userMessage: string;
  history: { role: "user" | "assistant"; content: string }[];
  profile: User;
  agentType: AgentType;
  fallback: (message: string) => string;
}): Promise<string> {
  const { systemPrompt, userMessage, history, profile, agentType, fallback } = params;
  const tools = agentType === "admin" ? ADMIN_TOOLS : STUDENT_TOOLS;
  const executeTool =
    agentType === "admin" ? executeAdminTool : executeStudentTool;

  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await callLLM(messages, tools);
    if (!response) return fallback(userMessage);

    if (response.tool_calls && response.tool_calls.length > 0) {
      messages.push({
        role: "assistant",
        content: response.content ?? "",
      } as AIMessage & { tool_calls?: ToolCall[] });
      (messages[messages.length - 1] as AIMessage & { tool_calls?: ToolCall[] }).tool_calls =
        response.tool_calls;

      for (const call of response.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = {};
        }

        const result = await executeTool(call.function.name, args, profile);

        messages.push({
          role: "tool",
          content: result,
          tool_call_id: call.id,
          name: call.function.name,
        });
      }
      continue;
    }

    if (response.content) return response.content;
    break;
  }

  const final = await callLLM(messages);
  return final?.content ?? fallback(userMessage);
}

export { getActiveProvider };
