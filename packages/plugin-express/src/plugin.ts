import express, { Express, Handler, IRouter, Request, Response } from "express";

import { PluginBase, PluginResult } from "@maiar-ai/core";
import { generateResponseTemplate } from "./templates";
import { ExpressPluginConfig, ExpressResponseSchema } from "./types";

export interface ExpressPlatformContext {
  platform: string;
  responseHandler?: (response: unknown) => void;
  metadata?: {
    req: Request;
    res: Response;
  };
}

export class PluginExpress extends PluginBase {
  private app: Express | null = null;

  constructor(
    private config: ExpressPluginConfig = { port: 3000, host: "localhost" },
    private routes: Record<string, Handler | IRouter> = {}
  ) {
    super({
      id: "plugin-express",
      name: "Express",
      description: "Handles HTTP requests for the Maiar agent"
    });

    this.addExecutor({
      name: "send_response",
      description: "Send a response to a pending HTTP request",
      execute: async (): Promise<PluginResult> => {
        const context = this.runtime.context;
        if (!context?.platformContext?.responseHandler) {
          console.error(
            "[Express Plugin] Error: No response handler available"
          );
          return {
            success: false,
            error: "No response handler available"
          };
        }

        try {
          // Format the response based on the context chain
          const formattedResponse = await this.runtime.operations.getObject(
            ExpressResponseSchema,
            generateResponseTemplate(context.contextChain),
            { temperature: 0.2 }
          );

          await context.platformContext.responseHandler(
            formattedResponse.message
          );
          return {
            success: true,
            data: {
              message: formattedResponse.message,
              helpfulInstruction:
                "This is the formatted response sent to the HTTP client"
            }
          };
        } catch (error) {
          console.error("[Express Plugin] Error sending response:", error);
          return {
            success: false,
            error: "Failed to send response"
          };
        }
      }
    });

    this.addTrigger({
      id: "http_request_listener",
      start: () => {
        console.log("[Express Plugin] Starting HTTP request listener");

        if (this.app) {
          console.warn("[Express Plugin] Express server already running");
          return;
        }
        const _app = express();
        _app.use(express.json());

        // mount the plugin instance on the request object
        _app.use((req: Request, res, next) => {
          req.plugin = this;
          next();
        });

        console.log("[Express Plugin] Express middleware configured");

        let customHealthCheck = false;
        Object.entries(this.routes).forEach(([route, handler]) => {
          if (route === "/health") {
            customHealthCheck = true;
          }
          _app.use(route, handler);
        });

        // Basic health check endpoint
        if (!customHealthCheck) {
          _app.get("/health", (req, res) => {
            console.log("[Express Plugin] Health check requested");
            res.json({ status: "ok" });
          });
        }

        // Start the server
        _app.listen(this.config.port, this.config.host || "localhost", () => {
          console.log(
            `[Express Plugin] Server is running on ${this.config.host || "localhost"}:${this.config.port}`
          );
        });

        this.app = _app;
      }
    });
  }
}
