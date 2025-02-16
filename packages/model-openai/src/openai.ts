import { createOpenAI, OpenAIProvider as Provider } from "@ai-sdk/openai";
import {
  createLogger,
  GenerateObjectParams,
  GenerateParams,
  ModelProvider
} from "@maiar-ai/core";
import { generateObject, generateText } from "ai";

const log = createLogger("model:openai");

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export class OpenAIProvider implements ModelProvider {
  readonly id = "openai";
  readonly name = "OpenAI";
  readonly description = "OpenAI API models like GPT-4 and GPT-3.5";

  private model: string;
  private provider: Provider;
  constructor(config: OpenAIConfig) {
    this.provider = createOpenAI({
      apiKey: config.apiKey
    });

    this.model = config.model ?? "gpt-4o";
  }

  async getText(params: GenerateParams): Promise<string> {
    try {
      const { prompt, config } = params;
      const { text } = await generateText({
        model: this.provider(this.model),
        prompt,
        temperature: config?.temperature ?? 0.7,
        maxTokens: config?.maxTokens,
        stopSequences: config?.stopSequences
      });

      if (!text) {
        throw new Error("No content in response");
      }

      return text;
    } catch (error) {
      log.error("Error getting text from OpenAI:", error);
      throw error;
    }
  }

  async getObject<OBJECT>(
    params: GenerateObjectParams<OBJECT>
  ): Promise<OBJECT> {
    try {
      const { prompt, schema, config } = params;
      const { object } = await generateObject({
        model: this.provider(this.model, { structuredOutputs: true }),
        prompt,
        schema: schema,
        temperature: config?.temperature ?? 0.7,
        maxTokens: config?.maxTokens
      });

      if (!object) {
        throw new Error("No content in response");
      }

      return object;
    } catch (error) {
      console.error(error);
      log.error("Error getting object from OpenAI:" + JSON.stringify(error));
      throw error;
    }
  }

  async init(): Promise<void> {
    // No initialization needed for OpenAI
  }
}
