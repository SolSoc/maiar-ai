import { z } from "zod";
import { generateSystemTemplate } from "../system/templates";
import { logModelInteraction } from "../utils/logger";
/**
 * Configuration for model requests
 */
export interface ModelRequestConfig {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

/**
 * Parameters for generating a response from a model
 */
export interface GenerateBaseParams {
  systemPrompt?: string;
  config?: ModelRequestConfig;
}

export interface GenerateWithPromptParams extends GenerateBaseParams {
  prompt: string;
  messages?: never;
}
export interface GenerateWithMessagesParams extends GenerateBaseParams {
  messages: { role: string; content: string }[];
  prompt?: never;
}

export type GenerateObjectSchema<OBJECT> = {
  schema: z.ZodSchema<OBJECT, z.ZodTypeDef, unknown>;
};

export type GenerateParams =
  | GenerateWithMessagesParams
  | GenerateWithPromptParams;

export type GenerateObjectParams<OBJECT> = GenerateParams &
  GenerateObjectSchema<OBJECT>;

// type StreamTextResponse = ReturnType<typeof streamText>;
// type StreamObjectResponse = ReturnType<typeof streamObject>;

/**
 * Base interface that all LLM models must implement
 */
export interface ModelInterface {
  /**
   * Get a text completion from the model
   */
  getText(params: GenerateParams): Promise<string>;

  /**
   * Generate a typed, structured object
   */
  getObject<OBJECT>(params: GenerateObjectParams<OBJECT>): Promise<OBJECT>;

  /**
   * Stream text from the model
   */
  // streamText(params: GenerateParams): StreamTextResponse;

  /**
   * Stream objects from the model
   */
  // streamObject<OBJECT>(
  //   params: GenerateObjectParams<OBJECT>
  // ): StreamObjectResponse;

  /**
   * Initialize the model with any necessary setup
   */
  init?(): Promise<void>;
}

export async function executeWithLogging<
  A extends GenerateParams,
  Method extends (args: A) => unknown
>(modelId: string, params: A, method: Method): Promise<ReturnType<Method>> {
  try {
    const systemTemplate = generateSystemTemplate();

    const { config } = params;
    logModelInteraction("system", {
      model: modelId,
      systemTemplate,
      config
    });

    let data = {};
    if ("messages" in params) {
      data = { messages: params.messages };
    } else if ("prompt" in params) {
      data = { prompt: params.prompt };
    } else {
      throw new Error("Params must specify either prompt or messages");
    }

    logModelInteraction("prompt", {
      model: modelId,
      ...data,
      config
    });

    const response = await method(params);

    // Log the response
    logModelInteraction("response", {
      model: modelId,
      response,
      execution_metadata: {
        timestamp: new Date().toISOString(),
        config
      }
    });

    return response;
  } catch (error) {
    // Log any errors
    logModelInteraction("error", {
      model: modelId,
      error: error instanceof Error ? error.message : String(error),
      status: "failed",
      prompt
    });
    throw error;
  }
}
