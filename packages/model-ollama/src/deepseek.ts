import {
  createLogger,
  GenerateObjectParams,
  GenerateParams,
  ModelProvider
} from "@maiar-ai/core";
import { generateObject, generateText, LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

const log = createLogger("models");

export interface DeepseekConfig {
  baseUrl: string;
  model: string;
}

const deepseekSystemTemplate = `
High level rules you must follow:
1. Always use english unless explicitly told otherwise in your output operations.
2. Your interal thoughs, considerations, and operations will always be in english.
3. You will not inject chinese characters, mandarin, or chinese into your thoughts, output operations, generated text, or anything else.
`;

export class DeepseekProvider implements ModelProvider {
  readonly id = "deepseek";
  readonly name = "Deepseek";
  readonly description = "Deepseek models running through Ollama";

  private baseUrl: string;
  private model: string;
  private client: LanguageModelV1;
  constructor(config: DeepseekConfig) {
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
        prompt: `${deepseekSystemTemplate}\n\n${prompt}\n\nAssistant: Let me help you with that.`,
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
        prompt: `${deepseekSystemTemplate}\n\n${prompt}\n\nAssistant: Let me help you with that.`,
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
