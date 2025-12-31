import { Ollama } from "hyperdata-clients";
import { BaseLLMProvider } from "tia-agents";

/**
 * Ollama provider implementation using hyperdata-clients
 * This provider connects to a local Ollama server and uses
 * locally-hosted models like qwen2.5:0.5b.
 */
export class OllamaProvider extends BaseLLMProvider {
  constructor({
    apiKey = "ollama", // Ollama doesn't require an API key but the field is expected
    baseURL = "http://localhost:11434",
    model = "qwen2.5:0.5b",
    nickname = "OllamaBot",
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
    this.baseURL = baseURL;
  }

  /**
   * Initialize Ollama client using hyperdata-clients
   */
  initializeClient(apiKey) {
    return new Ollama({
      apiKey,
      baseURL: this.baseURL
    });
  }

  /**
   * Complete chat request using Ollama API via hyperdata-clients
   */
  async completeChatRequest({ messages, maxTokens, temperature }) {
    // hyperdata-clients Ollama.chat(messages, options) returns text directly
    try {
      return await this.client.chat(messages, {
        model: this.model,
        temperature: temperature || 0.7,
        num_predict: maxTokens || 1000,
        stream: false
      });
    } catch (error) {
      this.logger.error("Ollama API error:", error);
      throw error;
    }
  }

  /**
   * Extract response text from Ollama API response
   */
  extractResponseText(response) {
    // hyperdata-clients Ollama.chat() already returns just the text content
    return typeof response === 'string' ? response.trim() : null;
  }
}
