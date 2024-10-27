import { CustomLlmResponse } from "../types";
import { WebSocket } from "ws";

export const sendWebSocketResponse = (
  ws: WebSocket,
  response: CustomLlmResponse,
) => {
  ws.send(JSON.stringify(response));
};
