# Minimal Mistral Agent

This is a minimal example showing how to create an XMPP agent with Mistral AI capabilities using the `tia-agents` framework.

## Quick Start

To create your own agent, copy this directory elsewhere and run:

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

## Files

```sh
├── config/agents/
│   ├── mistral2.ttl          # Agent profile configuration
│   ├── mistral-base.ttl      # Base definitions for Mistral agents
│   └── secrets.json          # XMPP password (auto-generated on first run)
├── mistral-provider.js       # Mistral LLM provider implementation
├── mistral-example.js        # Agent runner script
├── package.json              # Node.js package config (ESM)
└── .env                      # API keys (add to .gitignore!)
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

## Creating a New Agent

### Using Claude Code

If you're using [Claude Code](https://code.claude.com), there's a built-in skill to help you create new agents! Just ask:

```
"Help me create a new TIA agent"
"Build a bot using Groq"
"Set up an XMPP agent with Claude"
```

The `create-tia-agent` skill will guide you through:
- Copying and customizing this template
- Configuring for different LLM providers (Mistral, Groq, Claude, etc.)
- Setting up XMPP connections
- Troubleshooting common issues

### Manual Setup

To create a new agent (instead of using the example `mistral2`):

1. Copy `config/agents/mistral2.ttl` to `config/agents/your-agent.ttl`
2. Edit the new file and replace all occurrences of `mistral2` with your agent name
3. Set `AGENT_PROFILE=your-agent` in `.env` or export it before running
4. Run `node mistral-example.js` - the agent will auto-register with the XMPP server
