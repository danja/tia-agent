# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal TIA (Tensegrity Intelligence Agent) XMPP bot example using Mistral AI. It demonstrates how to create conversational agents that connect to XMPP chat rooms and respond using LLM providers through the `tia-agents` framework and `hyperdata-clients` library.

## Key Commands

```bash
# Install dependencies
npm install

# Run the Mistral agent
npm start
# or directly:
node mistral-example.js

# Run the Ollama agent (Oquen)
node oquen.js

# Run with custom agent profile
AGENT_PROFILE=your-agent npm start

# For Ollama: ensure model is pulled first
ollama pull qwen2.5:0.5b
```

## Architecture

### Core Components

**Agent Runner** (`mistral-example.js`):
- Profile-driven entry point
- Loads RDF/Turtle configuration from `config/agents/*.ttl`
- Initializes the provider and XMPP connection
- Uses `createSimpleAgent()` from `tia-agents` to wire everything together
- Handles auto-registration with XMPP server on first run

**LLM Provider** (`mistral-provider.js`):
- Extends `BaseLLMProvider` from `tia-agents`
- Implements three required methods:
  - `initializeClient(apiKey)` - Creates the LLM client
  - `completeChatRequest({ messages, maxTokens, temperature })` - Calls the API
  - `extractResponseText(response)` - Extracts text from API response
- Uses `hyperdata-clients` for unified LLM access across providers

**Profile Configuration** (`.ttl` files):
- `mistral-base.ttl`: Shared base configuration (XMPP server, room, default AI provider settings)
- `mistral2.ttl`: Specific agent instance (inherits from base, sets nickname and system prompt)
- RDF/Turtle format with custom vocabularies for agent properties
- Profile name must match filename (e.g., `<#mistral2>` in `mistral2.ttl`)

**Secrets Management**:
- `secrets.json`: Auto-generated XMPP passwords (created on first run)
- `.env`: API keys and optional configuration overrides
- `.env.example`: Template for required environment variables

### Data Flow

1. `mistral-example.js` loads profile from `.ttl` files using `loadAgentProfile()`
2. Profile provides XMPP credentials, room JID, nickname, and AI provider config
3. Provider is instantiated with API key from environment variable
4. `createSimpleAgent()` connects provider + XMPP account + room
5. Agent auto-registers with XMPP server if no password exists in `secrets.json`
6. Agent joins room and listens for messages
7. When mentioned, provider processes message through LLM API and responds

### Key Frameworks

**tia-agents**:
- Provides `AgentRunner`, `createSimpleAgent()`
- `BaseLLMProvider` base class for LLM integrations
- `InMemoryHistoryStore` for conversation history
- Profile loading from RDF/Turtle files
- XMPP connection handling and auto-registration
- Lingue protocol support for structured agent communication

**hyperdata-clients**:
- Unified API interface for multiple LLM providers
- Supports: Mistral, Groq, Claude (Anthropic), OpenAI, Ollama, Perplexity, HuggingFace
- Each provider exported as a class (e.g., `import { Mistral } from "hyperdata-clients"`)
- **IMPORTANT**: Each provider has a different API structure - see "Provider-Specific API Patterns" below

## Configuration Details

### Environment Variables

- `MISTRAL_API_KEY`: API key for Mistral (or other provider)
- `MISTRAL_MODEL`: Model to use (default: `mistral-small-latest`)
- `OLLAMA_API_KEY`: API key for Ollama (can be any string like "ollama")
- `OLLAMA_BASE_URL`: Ollama server URL (default: `http://localhost:11434`)
- `AGENT_PROFILE`: Which `.ttl` profile to load (default: `mistral2` or `oquen`)
- `XMPP_SERVER`: Optional override for XMPP server
- `XMPP_ROOM`: Optional override for MUC room

### RDF Profile Structure

Agent profiles use Turtle syntax with these key properties:

```turtle
<#agent-name> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  foaf:nick "DisplayName" ;                    # Display name in chat
  schema:identifier "agent-name" ;             # Agent identifier

  agent:xmppAccount [
    xmpp:username "agent-name" ;               # XMPP username
    xmpp:resource "DisplayName" ;              # XMPP resource
    xmpp:service "xmpp://server:5222" ;        # XMPP server (in base)
    xmpp:domain "server.tld"                   # XMPP domain (in base)
  ] ;

  agent:roomJid "room@conference.server.tld" ; # MUC room (in base)

  agent:aiProvider [
    a ai:MistralProvider ;                     # Provider type
    ai:model "mistral-small-latest" ;          # Model name
    ai:apiKeyEnv "MISTRAL_API_KEY" ;           # Env var for API key
    ai:systemPrompt "Your instructions..."     # System prompt
  ] .
```

## Creating New Agents

### Using the Claude Code Skill

This repository includes a `/create-tia-agent` skill. Users can invoke it by asking:
- "Help me create a new TIA agent"
- "Build a bot using Groq"
- "Set up an XMPP agent with Claude"

The skill automates the process documented in `.claude/skills/create-tia-agent/SKILL.md`.

### Manual Process

1. Copy this directory to a new location
2. Update `package.json` name field
3. Copy `.env.example` to `.env` and add API key
4. Rename `config/agents/mistral2.ttl` to `config/agents/your-agent.ttl`
5. Update all references from `mistral2` to `your-agent` in the `.ttl` file
6. Optionally rename and update `mistral-provider.js` for different LLM provider
7. Run `npm install && npm start`

### Switching LLM Providers

To use a different provider (Groq, Claude, OpenAI, etc.):

1. Update imports in provider file:
   ```javascript
   import { Groq } from "hyperdata-clients";  // or Claude, OpenAI, etc.
   ```

2. Rename class and adjust API calls in the three methods
3. Update `.ttl` file provider type (e.g., `ai:GroqProvider`)
4. Update `ai:apiKeyEnv` to match new provider's env var
5. Update `.env` with new API key

Each provider has slightly different API call syntax - refer to the provider's documentation or examples in the `create-tia-agent` skill.

### Provider-Specific API Patterns

**CRITICAL**: hyperdata-clients providers have different API structures. You must check the actual implementation in `node_modules/hyperdata-clients/src/providers/` when creating a new provider.

**Mistral/Groq/OpenAI** (nested client pattern):
```javascript
async completeChatRequest({ messages, maxTokens, temperature }) {
  return await this.client.client.chat.complete({
    model: this.model,
    messages,
    maxTokens,
    temperature
  });
}

extractResponseText(response) {
  return response.choices[0]?.message?.content?.trim() || null;
}
```

**Ollama** (simplified interface - returns text directly):
```javascript
async completeChatRequest({ messages, maxTokens, temperature }) {
  // Ollama.chat(messages, options) returns text content directly
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
```

**Key differences**:
- **Mistral/Groq/OpenAI**: Access via `this.client.client.chat.*`, return full response object
- **Ollama**: Access via `this.client.chat()`, returns text string directly
- **Ollama**: Takes `messages` as first parameter, `options` as second (not a single config object)
- **Ollama**: Uses `num_predict` instead of `maxTokens`
- **Ollama**: Doesn't require a real API key (can use any string like "ollama")
- **Ollama**: Requires `baseURL` parameter for local server connection

When implementing a new provider, always check the actual hyperdata-clients source code for that provider to understand its API structure.

## Important Patterns

### Profile Inheritance

Agents use `dcterms:isPartOf <#mistral-base>` to inherit base configuration. When creating new agents, they typically override only:
- `foaf:nick` (display name)
- `schema:identifier` (unique ID)
- `xmpp:username` and `xmpp:resource`
- `ai:systemPrompt` (specific instructions)

Base config provides shared settings like server, room, and default model.

### Auto-registration Flow

On first run, if no password exists in `secrets.json`:
1. Agent attempts XMPP registration with server
2. Server generates password and registers account
3. Password saved to `secrets.json` for future runs
4. Subsequent runs use stored password

### Provider Extension Points

`BaseLLMProvider` provides hooks for:
- `lingueEnabled`: Enable Lingue protocol for structured agent communication
- `lingueConfidenceMin`: Minimum confidence for Lingue protocol detection
- `ibisSummaryEnabled`: Enable IBIS (Issue-Based Information System) summaries
- `historyStore`: Custom conversation history storage (default: `InMemoryHistoryStore`)

## File Organization

```
.
├── config/agents/          # Agent profiles
│   ├── mistral-base.ttl    # Base configuration for Mistral agents
│   ├── mistral2.ttl        # Mistral agent instance
│   ├── ollama-base.ttl     # Base configuration for Ollama agents
│   ├── oquen.ttl           # Ollama agent instance (Qwen model)
│   └── secrets.json        # Auto-generated XMPP passwords (gitignored)
├── mistral-provider.js     # Mistral LLM provider implementation
├── mistral-example.js      # Mistral agent runner
├── ollama-provider.js      # Ollama LLM provider implementation
├── oquen.js                # Ollama agent runner (Qwen model)
├── package.json            # ESM package with dependencies
├── .env                    # API keys (gitignored)
└── .env.example            # Environment template
```

## Notes for Development

- This is an **ESM package** (`"type": "module"` in package.json)
- All imports must use `.js` extensions
- The agent runner is minimal by design - most configuration lives in `.ttl` files
- Provider implementation is intentionally simple with only 3 methods to customize
- XMPP connection details, room joining, message routing are handled by `tia-agents`
- Consider this a template/example to be copied and customized, not modified in place
