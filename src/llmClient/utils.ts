import { ChatCompletionChunk } from "openai/resources";
import { AvailableTools } from "./types";

export const getDeltaContentIfExists = (delta: ChatCompletionChunk) => {
  if (delta.choices.length >= 1 && delta.choices[0].delta?.content) {
    return delta.choices[0].delta.content;
  }
  return null;
};

export const getValidDeltaToolCallIfExists = (
  delta: ChatCompletionChunk,
  availableTools: AvailableTools,
) => {
  if (
    delta.choices.length >= 1 &&
    delta.choices[0].delta?.tool_calls &&
    delta.choices[0].delta.tool_calls[0] &&
    delta.choices[0].delta.tool_calls[0].function.name in availableTools
  ) {
    return delta.choices[0].delta.tool_calls[0];
  }
  return null;
};
