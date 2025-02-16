import * as z from "zod";
import { LLMService } from "../../models/service";
import { OperationConfig } from "../base";

export interface GetObjectConfig extends OperationConfig {
  maxRetries?: number;
}

export async function getObject<OBJECT>(
  service: LLMService,
  schema: z.ZodSchema<OBJECT, z.ZodTypeDef, unknown>,
  prompt: string,
  config?: GetObjectConfig
): Promise<OBJECT> {
  return await service.getObject(prompt, schema, config);
}
