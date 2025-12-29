import { Mistral } from "hyperdata-clients";
import { BaseLLMProvider } from "tia-agents";

/**
 * Mistral AI provider implementation using hyperdata-clients
 * This is an example provider that demonstrates how to integrate
 * any LLM API with the tia-agents framework.
 *
 * For other LLMs, simply replace Mistral with Groq, Claude, OpenAI, etc.
 * from hyperdata-clients and adjust the API calls accordingly.
 */
export class MistralProvider extends BaseLLMProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    systemPrompt = null,
    systemTemplate = null,
    historyStore = null,
    lingueEnabled = true,
    lingueConfidenceMin = 0.5,
    ibisSummaryEnabled = false,
    discoFeatures = undefined,
    xmppClient = null,
    logger = console
  }) {
    super({
      apiKey,
      model,
      nickname,
      systemPrompt,
      systemTemplate,
      historyStore,
      lingueEnabled,
      lingueConfidenceMin,
      ibisSummaryEnabled,
      discoFeatures,
      xmppClient,
      logger
    });
  }

  /**
   * Initialize Mistral API client using hyperdata-clients
   */
  initializeClient(apiKey) {
    return new Mistral({ apiKey });
  }

  /**
   * Complete chat request using Mistral API via hyperdata-clients
   */
  async completeChatRequest({ messages, maxTokens, temperature }) {
    // hyperdata-clients wraps the underlying API client
    return await this.client.client.chat.complete({
      model: this.model,
      messages,
      maxTokens,
      temperature
    });
  }

  /**
   * Extract response text from Mistral API response
   */
  extractResponseText(response) {
    return response.choices[0]?.message?.content?.trim() || null;
  }
}
