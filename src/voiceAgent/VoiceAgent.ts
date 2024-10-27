import { AgentConversation } from "./VoiceAgentConversation";
import { VoiceAgentResponseGenerator } from "./VoiceAgentResponseGenerator";
import { ResponseRequiredRequest } from "../types";

export class VoiceAgent {
  private conversation: AgentConversation;
  private responseGenerator: VoiceAgentResponseGenerator;

  constructor(responseGenerator: VoiceAgentResponseGenerator) {
    this.conversation = new AgentConversation();
    this.responseGenerator = responseGenerator;
  }

  sendBeginMessage(): Promise<void> {
    return this.responseGenerator.sendBeginMessage();
  }

  respond(request: ResponseRequiredRequest): Promise<void> {
    this.conversation.setMessagesFromUtterances(request.transcript);
    return this.responseGenerator.streamResponse(this.conversation, request);
  }
}
