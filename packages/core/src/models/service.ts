import { z } from "zod";
import { createLogger } from "../utils/logger";
import { executeWithLogging, ModelInterface, ModelRequestConfig } from "./base";

const log = createLogger("models");

/**
 * Interface for model providers
 * Each provider should implement this interface and be instantiated with its config
 */
export interface ModelProvider extends ModelInterface {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

/**
 * Service for managing LLM operations
 */
export class LLMService {
  private models: Map<string, ModelProvider> = new Map();
  private defaultModelId: string | null = null;

  constructor(model?: ModelProvider) {
    log.debug({ msg: "Initializing LLM service" });
    if (model) {
      this.registerModel(model, "default");
    }
  }

  /**
   * Register a model
   */
  registerModel(model: ModelProvider, modelId: string): void {
    this.models.set(modelId, model);

    // Set as default if it's the first model
    if (this.defaultModelId === null) {
      this.defaultModelId = modelId;
    }

    log.debug({ msg: "Registered model instance", modelId });
  }

  /**
   * Get text completion from the default or specified model
   */
  async getText(
    prompt: string,
    config?: ModelRequestConfig & { modelId?: string }
  ): Promise<string> {
    const [modelId, model] = this.getModel(config?.modelId);
    return await executeWithLogging(modelId, { prompt, config }, model.getText);
  }

  /**
   * Get a structured object from the default or specified model
   */
  async getObject<OBJECT>(
    prompt: string,
    schema: z.ZodSchema<OBJECT, z.ZodTypeDef, unknown>,
    config?: ModelRequestConfig & { modelId?: string }
  ): Promise<OBJECT> {
    const [modelId, model] = this.getModel(config?.modelId);
    return (await executeWithLogging(
      modelId,
      { prompt, schema, config },
      model.getObject
    )) as OBJECT;
  }

  /**
   * Get the model ID and instance. If no model ID is provided, use the default model
   */
  getModel(modelId?: string): [string, ModelProvider] {
    const id = modelId || this.defaultModelId;
    if (!id) {
      throw new Error("No model available");
    }
    const model = this.models.get(id);
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    return [id, model];
  }
  /**
   * Set the default model
   */
  setDefaultModel(modelId: string): void {
    if (!this.models.has(modelId)) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    this.defaultModelId = modelId;
    log.debug({ msg: "Set default model", modelId });
  }

  /**
   * Get the current default model ID
   */
  getDefaultModelId(): string | null {
    return this.defaultModelId;
  }

  /**
   * Get all registered model IDs
   */
  getModelIds(): string[] {
    return Array.from(this.models.keys());
  }
}
