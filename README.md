# TIA Agent Examples

This repository contains minimal examples showing how to create XMPP agents with LLM capabilities using the `tia-agents` framework. Includes both cloud API (Mistral) and local model (Ollama) examples.

## Quick Start

### Mistral Example (Cloud API)

```sh
npm install
```

Copy `.env.example` to `.env` and insert your [Mistral API key](https://admin.mistral.ai/organization/api-keys).

Run the agent:

```sh
npm start
# or directly:
node mistral-example.js
```

This launches the bot `mistral2`, connects to the XMPP server on `tensegrity.it`, and channels messages through the Mistral API.

### Oquen Example (Local Ollama)

For running local models with Ollama:

```sh
# Ensure Ollama is installed and running
ollama pull qwen2.5:0.5b

npm install

# Run the Ollama-based agent
node oquen.js
```

This launches the bot `Oquen`, powered by the Qwen 2.5 0.5B model running locally via Ollama. No API key required!

## Files

```sh
├── config/agents/
│   ├── mistral2.ttl          # Mistral agent profile
│   ├── mistral-base.ttl      # Base config for Mistral agents
│   ├── oquen.ttl             # Oquen (Ollama) agent profile
│   ├── ollama-base.ttl       # Base config for Ollama agents
│   └── secrets.json          # XMPP passwords (auto-generated on first run)
├── mistral-provider.js       # Mistral LLM provider implementation
├── mistral-example.js        # Mistral agent runner
├── ollama-provider.js        # Ollama LLM provider implementation
├── oquen.js                  # Oquen agent runner (Qwen via Ollama)
├── package.json              # Node.js package config (ESM)
└── .env                      # API keys and config (add to .gitignore!)
```

## How It Works

The `tia-agents` framework provides:
- Core agent machinery (`AgentRunner`, `createSimpleAgent`)
- Base classes for building providers (`BaseLLMProvider`)
- Profile loading from RDF/Turtle files
- XMPP connection handling and auto-registration
- History storage
- Lingue protocol support

LLM API access is handled through the [`hyperdata-clients`](https://www.npmjs.com/package/hyperdata-clients) package, which provides a unified interface for:
- Mistral
- Groq
- Claude (Anthropic)
- OpenAI
- Ollama
- Perplexity
- HuggingFace

## Using Different LLMs

To use a different LLM provider, edit `mistral-provider.js`:

```javascript
// For Groq:
import { Groq } from "hyperdata-clients";

export class GroqProvider extends BaseLLMProvider {
  initializeClient(apiKey) {
    return new Groq({ apiKey });
  }
  // ... adjust API calls as needed
}
```

Or for Claude:

```javascript
import { Claude } from "hyperdata-clients";
// ... similar pattern
```

### Using Local Models with Ollama

The `ollama-provider.js` demonstrates running local LLM models. Key differences from cloud APIs:

```javascript
import { Ollama } from "hyperdata-clients";

export class OllamaProvider extends BaseLLMProvider {
  constructor({ baseURL = "http://localhost:11434", ...config }) {
    super(config);
    this.baseURL = baseURL;
  }

  initializeClient(apiKey) {
    return new Ollama({ apiKey, baseURL: this.baseURL });
  }

  async completeChatRequest({ messages, maxTokens, temperature }) {
    // Ollama.chat() returns text directly, not a response object
    return await this.client.chat(messages, {
      model: this.model,
      temperature: temperature || 0.7,
      num_predict: maxTokens || 1000,
      stream: false
    });
  }

  extractResponseText(response) {
    // Response is already a string
    return typeof response === 'string' ? response.trim() : null;
  }
}
```

**Benefits of Ollama**:
- ✅ No API costs - runs completely locally
- ✅ Privacy - your data never leaves your machine
- ✅ Works offline
- ✅ Supports many models: Llama, Mistral, Qwen, Gemma, Phi, etc.
- ✅ Fast inference on modern hardware

**Note**: The Ollama provider has a different API structure than cloud providers. It returns text directly rather than a response object, and uses `num_predict` instead of `maxTokens`.

## Creating a New Agent

### Using Claude Code

If you're using [Claude Code](https://code.claude.com), there's a built-in skill to help you create new agents! Just ask:

```
"Help me create a new TIA agent"
"Build a bot using Groq"
"Set up an XMPP agent with Claude"
"Create an Ollama agent with Llama"
```

The `create-tia-agent` skill will guide you through:
- Copying and customizing this template
- Configuring for different LLM providers (Mistral, Groq, Claude, Ollama, etc.)
- Setting up XMPP connections
- Handling provider-specific API differences
- Troubleshooting common issues

### Manual Setup

To create a new agent (instead of using the example `mistral2`):

1. Copy `config/agents/mistral2.ttl` to `config/agents/your-agent.ttl`
2. Edit the new file and replace all occurrences of `mistral2` with your agent name
3. Set `AGENT_PROFILE=your-agent` in `.env` or export it before running
4. Run `node mistral-example.js` - the agent will auto-register with the XMPP server
