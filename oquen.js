#!/usr/bin/env node
/**
 * Oquen - Ollama/Qwen AI Bot (profile-driven)
 *
 * Uses config from config/agents/*.ttl and secrets.json.
 * Connects to local Ollama server using the qwen2.5:0.5b model.
 */

import dotenv from "dotenv";
import { createSimpleAgent, InMemoryHistoryStore, loadAgentProfile } from "tia-agents";
import { OllamaProvider } from "./ollama-provider.js";

dotenv.config();

const PROFILE_DIR = "./config/agents";
const PROFILE_NAME = process.env.AGENT_PROFILE || "oquen";
const SECRETS_PATH = `${PROFILE_DIR}/secrets.json`;

async function main() {
  const profile = await loadAgentProfile(PROFILE_NAME, {
    profileDir: PROFILE_DIR,
    secretsPath: SECRETS_PATH,
    allowMissingPasswordKey: true
  });
  if (!profile?.provider) {
    throw new Error(`Profile "${PROFILE_NAME}" is missing aiProvider config`);
  }

  const providerConfig = profile.provider.toConfig();
  const apiKeyEnv = providerConfig.apiKeyEnv || "OLLAMA_API_KEY";
  const apiKey = process.env[apiKeyEnv] || "ollama"; // Ollama doesn't require a real API key

  const baseURL = process.env.OLLAMA_BASE_URL || providerConfig.baseURL || "http://localhost:11434";

  const provider = new OllamaProvider({
    apiKey,
    baseURL,
    model: providerConfig.model || "qwen2.5:0.5b",
    nickname: profile.nickname,
    systemPrompt: providerConfig.systemPrompt,
    systemTemplate: providerConfig.systemTemplate,
    lingueEnabled: providerConfig.lingueEnabled,
    lingueConfidenceMin: providerConfig.lingueConfidenceMin,
    historyStore: new InMemoryHistoryStore({ maxEntries: 40 }),
    logger: console
  });

  const xmppConfig = {
    ...profile.xmppAccount?.toConfig(),
    tls: profile.xmppAccount?.tls
  };

  const runner = createSimpleAgent({
    xmppConfig,
    roomJid: profile.roomJid,
    nickname: profile.nickname,
    provider,
    autoRegister: true,
    secretsPath: SECRETS_PATH,
    logger: console
  });

  await runner.start();

  console.log(`✅ ${profile.nickname} connected to ${profile.roomJid}`);
  console.log(`- Profile: ${PROFILE_NAME}`);
  console.log(`- Model: ${providerConfig.model || "qwen2.5:0.5b"}`);
  console.log(`- Ollama URL: ${baseURL}`);

  process.on("SIGINT", async () => {
    await runner.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await runner.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("❌ Failed to start bot:", error.message);
  process.exit(1);
});
