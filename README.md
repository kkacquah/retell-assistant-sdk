# Retell Assistant Typescript SDK (Draft)

This repository is a fork of [Retell's custom LLM integration demo](https://github.com/RetellAI/retell-custom-llm-example), extended to provide a more comprehensive typscript voice assistant SDK. The SDK is designed to support:

- Custom logging and analytics for voice interactions
- Response moderation and filtering capabilities
- Integration with prompt management services
- A/B testing and prompt experimentation
- Structured handling of tool calls and function execution
- Flexible configuration of voice agent behaviors

The example code demonstrates an appointment scheduling use case, but the SDK architecture allows for building various types of voice assistants with different capabilities and conversation flows.

## Configuration Options

The SDK allows customization of voice agents through several configuration options:

### Voice Agent Configuration Options

- `systemMessageSlug`: The system prompt that defines the agent's role and behavior
- `beginSentence`: The initial greeting message the agent uses to start conversations
- `availableTools`: The tool calls made available to the agent.
- `chatCompletionOptions`: LLM-specific settings including:
  - `temperature`: Controls response randomness (0-1)
  - `max_tokens`: Maximum length of generated responses
  - `frequency_penalty`: Reduces repetition in responses
  - `presence_penalty`: Encourages topic diversity
  - `model`: The LLM model to use (e.g. "gpt-4-turbo-preview")

## Steps to run locally to test

1. Add Retell and your LLM API key (Azure OpenAI / OpenAI / OpenRouter) to ".env.development".

   - Azure OpenAI is pretty fast and stable: [guide for setup](https://docs.retellai.com/guide/azure-open-ai)
   - OpenAI is the most widely used one, although the latency can vary.
   - OpenRouter allows you to choose between tons of Open Source AI Models.

2. Install dependencies

```bash
npm install
```

3. In another bash, use ngrok to expose this port to the public network

```bash
ngrok http 8080
```

4. Start the server

```bash
npm run dev
```

You should see a fowarding address like
`https://dc14-2601-645-c57f-8670-9986-5662-2c9a-adbd.ngrok-free.app`, and you
are going to take the hostname `dc14-2601-645-c57f-8670-9986-5662-2c9a-adbd.ngrok-free.app`, prepend it with `wss://`, postpend with
`/llm-websocket` (the route setup to handle LLM websocket connection in the code) to create the url to use in the [dashboard](https://beta.retellai.com/dashboard) to create a new agent. Now
the agent you created should connect with your localhost.

The custom LLM URL would look like
`wss://dc14-2601-645-c57f-8670-9986-5662-2c9a-adbd.ngrok-free.app/llm-websocket`

## Run in prod

To run in prod, you probably want to customize your LLM solution, host the code
in a cloud, and use that IP to create the agent.
