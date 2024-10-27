import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { RawData, WebSocket } from "ws";
import { createServer, Server as HTTPServer } from "http";
import cors from "cors";
import { Retell } from "retell-sdk";
import { CustomLlmRequest } from "../types";
import OpenAI from "openai";
import { AppointmentSchedulingVoiceAgent } from "./agents/AppointmentSchedulingVoiceAgent";
import { sendWebSocketResponse } from "../utils";

export class VoiceAgentServer {
  public app: expressWs.Application;
  private _httpServer: HTTPServer;

  constructor() {
    this.app = expressWs(express()).app;
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this._httpServer = createServer(this.app);
    this.handleRetellLlmWebSocket();
    this.handleWebhook();
  }

  listen(port: number): void {
    this.app.listen(port);
    console.log("Listening on " + port);
  }

  /* Handle webhook from Retell server. This is used to receive events from Retell server.
     Including call_started, call_ended, call_analyzed */
  handleWebhook() {
    this.app.post("/webhook", (req: Request, res: Response) => {
      if (
        !Retell.verify(
          JSON.stringify(req.body),
          process.env.RETELL_API_KEY,
          req.headers["x-retell-signature"] as string,
        )
      ) {
        console.error("Invalid signature");
        return;
      }
      const content = req.body;
      switch (content.event) {
        case "call_started":
          console.log("Call started event received", content.data.call_id);
          break;
        case "call_ended":
          console.log("Call ended event received", content.data.call_id);
          break;
        case "call_analyzed":
          console.log("Call analyzed event received", content.data.call_id);
          break;
        default:
          console.log("Received an unknown event:", content.event);
      }
      // Acknowledge the receipt of the event
      res.json({ received: true });
    });
  }

  /* Start a websocket server to exchange text input and output with Retell server. Retell server 
     will send over transcriptions and other information. This server here will be responsible for
     generating responses with LLM and send back to Retell server.*/
  handleRetellLlmWebSocket() {
    this.app.ws(
      "/llm-websocket/:call_id",
      async (ws: WebSocket, req: Request) => {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_APIKEY,
        });
        try {
          const callId = req.params.call_id;
          console.log("Handle llm ws for: ", callId);

          // Send config to Retell server
          sendWebSocketResponse(ws, {
            response_type: "config",
            config: {
              auto_reconnect: true,
              call_details: true,
            },
          });
          console.log("Sending config to Retell server");
          const voiceAgent = new AppointmentSchedulingVoiceAgent(ws, openai);
          console.log("Initialized voice agent");
          // Start sending the begin message to signal the client is ready.
          ws.on("error", (err) => {
            console.error("Error received in LLM websocket client: ", err);
          });
          ws.on("close", (err) => {
            console.error("Closing llm ws for: ", callId);
          });

          ws.on("message", async (data: RawData, isBinary: boolean) => {
            console.log("Received message from Retell server");
            console.log(data.toString());
            if (isBinary) {
              console.error("Got binary message instead of text in websocket.");
              ws.close(1007, "Cannot find corresponding Retell LLM.");
            }
            // Log the request sent by retell
            const request: CustomLlmRequest = JSON.parse(data.toString());
            // If the request is call_details, send the begin message to start the conversation
            if (request.interaction_type === "call_details") {
              voiceAgent.sendBeginMessage();
            } else if (request.interaction_type === "ping_pong") {
              // If the request is ping_pong, send a pong response
              ws.send(
                JSON.stringify({
                  response_type: "ping_pong",
                  timestamp: request.timestamp,
                }),
              );
            } else if (request.interaction_type === "response_required") {
              voiceAgent.respond(request);
            }
          });
        } catch (err) {
          console.error("Encountered error:", err);
          ws.close(1011, "Encountered error: " + err);
        }
      },
    );
  }
}
