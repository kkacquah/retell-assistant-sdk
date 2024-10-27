import OpenAI from "openai";
import { ResponseRequiredRequest } from "../types";
import { AvailableTools, ChatCompletionPromptParameters } from "./types";
import {
  getDeltaContentIfExists,
  getValidDeltaToolCallIfExists,
} from "./utils";
import { AgentConversation } from "./VoiceAgentConversation";
import { VoiceAgentConfiguration } from "./VoiceAgentConfiguration";
import { WebSocket } from "ws";
import { sendWebSocketResponse } from "../utils";

export class VoiceAgentResponseGenerator {
  readonly client: OpenAI;
  readonly ws: WebSocket;
  readonly availableTools: AvailableTools;
  readonly config: VoiceAgentConfiguration;

  constructor({
    availableTools,
    ws,
    client,
    config,
  }: {
    availableTools: AvailableTools;
    ws: WebSocket;
    client: OpenAI;
    config: VoiceAgentConfiguration;
  }) {
    this.availableTools = availableTools;
    this.ws = ws;
    this.client = client;
    this.config = config;
  }

  private streamToolCallInvocationResponse(
    toolCall: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall,
  ) {
    sendWebSocketResponse(this.ws, {
      response_type: "tool_call_invocation",
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      arguments: JSON.stringify(toolCall.function.arguments),
    });
  }

  private streamContentResponse(
    responseId: number,
    content: string,
    isComplete: boolean,
  ) {
    sendWebSocketResponse(this.ws, {
      response_type: "response",
      response_id: responseId,
      content,
      content_complete: isComplete,
      end_call: false,
    });
  }

  private getChatCompletionPromptParameters(
    conversation: AgentConversation,
    config: VoiceAgentConfiguration,
  ): ChatCompletionPromptParameters {
    return {
      messages: conversation.getChatCompletionMessages(
        config.getChatCompletionPromptConfiguration().systemMessage,
      ),
      options: {
        tools: config.getChatCompletionPromptConfiguration().toolCalls,
        ...config.getChatCompletionPromptConfiguration().chatCompletionOptions,
      },
    };
  }

  async sendBeginMessage() {
    this.streamContentResponse(
      0,
      this.config.getChatCompletionPromptConfiguration().beginSentence,
      true,
    );
  }

  async streamResponse(
    conversation: AgentConversation,
    request: ResponseRequiredRequest,
  ): Promise<void> {
    const promptParameters = this.getChatCompletionPromptParameters(
      conversation,
      this.config,
    );
    try {
      let eventStream = await this.client.chat.completions.create({
        ...promptParameters.options,
        messages: promptParameters.messages,
        stream: true,
      });
      for await (const event of eventStream) {
        const content = getDeltaContentIfExists(event);
        if (content) {
          this.streamContentResponse(request.response_id, content, false);
        }
        const toolCall = getValidDeltaToolCallIfExists(
          event,
          this.availableTools,
        );
        if (toolCall) {
          this.streamToolCallInvocationResponse(toolCall);
        }
      }
    } catch (err) {
      console.error(
        `Error streaming GPT response: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }
  }
}
