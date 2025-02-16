import { createAnthropic } from "@ai-sdk/anthropic";
import {
  createLogger,
  GenerateObjectParams,
  GenerateParams,
  ModelProvider
} from "@maiar-ai/core";
import { generateObject, generateText, LanguageModelV1 } from "ai";

const log = createLogger("model:anthropic");

export interface AnthropicConfig {
  apiKey: string;
  model: string;
}

export class AnthropicProvider implements ModelProvider {
  readonly id = "anthropic";
  readonly name = "Anthropic";
  readonly description = "Anthropic API models like Claude";

  private model: string;
  private instance: LanguageModelV1;
  constructor(config: AnthropicConfig) {
    const anthropic = createAnthropic({
      apiKey: config.apiKey
    });

    this.model = config.model ?? "claude-3-5-haiku-20241022";
    this.instance = anthropic(this.model);
  }

  async getText(params: GenerateParams): Promise<string> {
    try {
      const { prompt, config } = params;
      const { text } = await generateText({
        model: this.instance,
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
      log.error("Error getting text from Anthropic:", error);
      throw error;
    }
  }

  async getObject<OBJECT>(
    params: GenerateObjectParams<OBJECT>
  ): Promise<OBJECT> {
    try {
      const { prompt, schema, config } = params;
      const { object } = await generateObject({
        model: this.instance,
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
      log.error("Error getting object from Anthropic:" + JSON.stringify(error));
      throw error;
    }
  }

  async init(): Promise<void> {
    // No initialization needed for Anthropic
  }
}
