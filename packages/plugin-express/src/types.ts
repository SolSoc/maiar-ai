import { Request, RequestHandler, Router } from "express";
import { z } from "zod";
import { PluginExpress } from "./plugin";

/**
 * A route definition for the Express server.
 */
export interface ExpressRoute {
  path: string;
  method?: string;
  /**
   * Support middlewares, routers, etc.
   */
  handler: Router | RequestHandler;
}

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

  routes: ExpressRoute[];
}

export interface ExpressRequest extends Request {
  plugin?: PluginExpress;
}

export const ExpressResponseSchema = z.object({
  message: z.string().describe("The response data to send back to the client")
});
