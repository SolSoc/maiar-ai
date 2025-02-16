import {
  createLogger,
  GenerateObjectParams,
  GenerateParams,
  ModelProvider
} from "@maiar-ai/core";
import { generateObject, generateText, LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

const log = createLogger("model:ollama");

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export class OllamaProvider implements ModelProvider {
  readonly id = "ollama";
  readonly name = "Ollama";
  readonly description = "Local Ollama models like Llama 2 and Mistral";

  private baseUrl: string;
  private model: string;

  private client: LanguageModelV1;
  constructor(config: OllamaConfig) {
    if (!config.baseUrl) {
      throw new Error("baseUrl is required");
    }
    if (!config.model) {
      throw new Error("model is required");
    }

    this.model = config.model;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    const ollama = createOllama({
      baseURL: this.baseUrl
    });
    this.client = ollama(this.model);
  }

  async getText(params: GenerateParams): Promise<string> {
    try {
      const { prompt, config } = params;

      log.info("Sending prompt to Deepseek:", prompt);

      const { text } = await generateText({
        model: this.client,
        prompt,
        temperature: config?.temperature ?? 0.7,
        stopSequences: config?.stopSequences
      });

      // Someone else will need to test to see if this is necessary
      // log.info("Received response from Deepseek:", text);

      // // Remove the "Assistant: Let me help you with that." prefix if it exists
      // const cleanedText = text.replace(
      //   /^Assistant: Let me help you with that\.\s*/,
      //   ""
      // );

      return text;
    } catch (error) {
      log.error("Error getting text from Deepseek:", error);
      throw error;
    }
  }

  async getObject<OBJECT>(
    params: GenerateObjectParams<OBJECT>
  ): Promise<OBJECT> {
    try {
      const { prompt, schema, config } = params;

      log.info("Sending prompt to Deepseek:", prompt);

      const { object } = await generateObject({
        model: this.client,
        prompt,
        schema: schema,
        temperature: config?.temperature ?? 0.7,
        maxTokens: config?.maxTokens
      });

      // Someone else will need to test to see if this is necessary
      // log.info("Received response from Deepseek:", object);

      return object;
    } catch (error) {
      log.error("Error getting object from Deepseek:", error);
      throw error;
    }
  }

  async init(): Promise<void> {
    // No initialization needed for Deepseek
  }
}
