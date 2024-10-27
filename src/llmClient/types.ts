import { ChatCompletionCreateParams } from "openai/resources/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources";

export type ChatCompletionPromptParameters = {
  messages: ChatCompletionMessageParam[];
  options: Omit<ChatCompletionCreateParams, "messages">;
};

// Define a generic type for tool definitions
export type ToolDefinition<T extends Record<string, any>> = {
  toolCall: ChatCompletionCreateParams.Function;
  handler: (args: T) => Promise<any>;
};

// Define the structure for available tools
export type AvailableTools = {
  [K: string]: ToolDefinition<any>;
};

// Define a type for tool calls that ensures the args match the tool definition
export type ToolCall<T extends AvailableTools> = {
  [K in keyof T]: {
    name: K;
    args: Parameters<T[K]["handler"]>[0];
  };
}[keyof T];

// Example usage:
// const availableTools: AvailableTools = {
//   get_weather: {
//     toolCall: { ... },
//     handler: (args: { location: string, unit: 'celsius' | 'fahrenheit' }) => Promise<string>
//   },
//   // ... other tools
// };

// type WeatherToolCall = ToolCall<typeof availableTools>;
// This type will ensure that when calling 'get_weather', the args match the handler's parameters
