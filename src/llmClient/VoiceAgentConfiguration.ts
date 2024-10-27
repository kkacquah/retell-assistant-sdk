import { ChatCompletionsFunctionToolDefinition } from "@azure/openai";
import { AvailableTools } from "./types";

type ChatCompletionOptions = {
  temperature: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
  model: string;
};
export type ChatCompletionPromptConfiguration = {
  systemMessage: string;
  toolCalls: ChatCompletionsFunctionToolDefinition[];
  beginSentence: string;
  chatCompletionOptions: ChatCompletionOptions;
};

export class VoiceAgentConfiguration {
  readonly config: {
    systemMessageSlug: string;
    beginSentence: string;
    availableTools: AvailableTools;
    chatCompletionOptions: ChatCompletionOptions;
  };

  constructor(config: {
    systemMessageSlug: string;
    beginSentence: string;
    availableTools: AvailableTools;
    chatCompletionOptions: ChatCompletionOptions;
  }) {
    this.config = config;
  }

  getChatCompletionPromptConfiguration(): ChatCompletionPromptConfiguration {
    // TODO: Implement logic to fetch system prompt from LLMOps platform using the slug
    // For now, return a placeholder
    return {
      systemMessage: `System prompt for ${this.config.systemMessageSlug}`,
      toolCalls: Object.values(this.config.availableTools).map((tool) => ({
        type: "function",
        function: tool.toolCall,
      })),
      beginSentence: this.config.beginSentence,
      chatCompletionOptions: this.config.chatCompletionOptions,
    };
  }
}
