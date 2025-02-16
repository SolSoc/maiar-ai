import { z } from "zod";
/**
 * Configuration options for the Express plugin.
 */
export interface ExpressPluginConfig {
  /**
   * The port number that the Express server should listen on.
   * @default 3000
   */
  port: number;

  /**
   * The host address to bind to.
   * Use '0.0.0.0' to listen on all network interfaces.
   * @default 'localhost'
   */
  host?: string;
}

export const ExpressResponseSchema = z.object({
  message: z.string().describe("The response data to send back to the client")
});
