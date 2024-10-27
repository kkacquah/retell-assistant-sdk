import { z } from "zod";
import { VoiceAgentConfiguration } from "../../voiceAgent/VoiceAgentConfiguration";
import { VoiceAgentResponseGenerator } from "../../voiceAgent/VoiceAgentResponseGenerator";
import { VoiceAgent } from "../../voiceAgent/VoiceAgent";
import OpenAI from "openai";
import { WebSocket } from "ws";
import { AvailableTools } from "../../voiceAgent/types";

const appointmentSchedulingParameters = z.object({
  time: z.string(),
});
const availableTools: AvailableTools = {
  schedule_appointment: {
    toolCall: {
      name: "schedule_appointment",
      description: "Schedule an appointment",
      parameters: {
        type: "object",
        properties: appointmentSchedulingParameters.shape,
        required: ["date"],
      },
    },
    handler: async (args: z.infer<typeof appointmentSchedulingParameters>) => {
      console.log("Appointment scheduled for " + args.time);
    },
  },
};
export class AppointmentSchedulingVoiceAgent extends VoiceAgent {
  constructor(ws: WebSocket, client: OpenAI) {
    // Define the parameters for tool calls here.

    super(
      new VoiceAgentResponseGenerator({
        availableTools,
        ws,
        client,
        config: new VoiceAgentConfiguration({
          // This should be a key referencing a prompt stored in a prompt manager, but defining
          // prompt details in here for now.
          systemMessageSlug: `
          You are a customer service agent for Simply Storage, a storage facility company.
          You are helping a customer schedule an appointment to visit one of your facilities.
          After scheduling the appointment, you will confirm the appointment with the customer.
          `,
          beginSentence: `Hi, it's Jan from simply storage. Would you like to schedule an appointment to visit one of our facilities?`,
          availableTools,
          chatCompletionOptions: {
            temperature: 0.5,
            max_tokens: 1000,
            frequency_penalty: 0,
            presence_penalty: 0,
            model: "gpt-4-turbo-preview",
          },
        }),
      }),
    );
  }
}
