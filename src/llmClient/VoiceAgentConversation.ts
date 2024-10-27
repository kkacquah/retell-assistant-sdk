import { ChatCompletionMessageParam } from "openai/resources";
import { Utterance } from "../types";

export class AgentConversation {
  messages: ChatCompletionMessageParam[];

  constructor() {
    this.messages = [];
  }

  setMessagesFromUtterances(utterances: Utterance[]) {
    this.messages = utterances.map((utterance) => ({
      role: utterance.role === "agent" ? "assistant" : "user",
      content: utterance.content,
    }));
  }

  getChatCompletionMessages(
    systemMessage: string,
  ): ChatCompletionMessageParam[] {
    return [
      {
        role: "system",
        content: systemMessage,
      },
      ...this.messages,
    ];
  }
}
