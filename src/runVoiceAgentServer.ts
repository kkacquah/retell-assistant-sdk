import dotenv from "dotenv";
import { VoiceAgentServer } from "./voiceAgentServer";
// Load up env file which contains credentials
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const server = new VoiceAgentServer();
server.listen(8080);
