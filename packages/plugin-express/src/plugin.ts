import express, { Express, Request, Response } from "express";

import { PluginBase, PluginResult } from "@maiar-ai/core";
import { generateResponseTemplate } from "./templates";
import {
  ExpressPluginConfig,
  ExpressRequest,
  ExpressResponseSchema
} from "./types";

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
    private config: ExpressPluginConfig = {
      port: 3000,
      host: "localhost",
      routes: []
    }
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

        this.app = express();
        this.app.use(express.json());
        console.log("[Express Plugin] Express middleware configured");

        // Add plugin instance to the request object
        this.app.use((req: ExpressRequest, _res, next) => {
          req.plugin = this;
          next();
        });

        // Basic health check endpoint
        this.app.get("/health", (req, res) => {
          console.log("[Express Plugin] Health check requested");
          res.json({ status: "ok" });
        });

        // Add routes to the Express server
        for (const route of this.config.routes) {
          const method = (route.method || "").toLowerCase();
          if (!method) {
            this.app.use(route.path, route.handler);
          } else if (method === "get") {
            this.app.get(route.path, route.handler);
          } else if (method === "post") {
            this.app.post(route.path, route.handler);
          } else if (method === "put") {
            this.app.put(route.path, route.handler);
          } else if (method === "delete") {
            this.app.delete(route.path, route.handler);
          } else if (method === "patch") {
            this.app.patch(route.path, route.handler);
          } else {
            console.warn(
              `[Express Plugin] Unsupported method for route ${route.path}: ${route.method}`
            );
          }
        }

        // Start the server
        this.app.listen(
          this.config.port,
          this.config.host || "localhost",
          () => {
            console.log(
              `[Express Plugin] Server is running on ${this.config.host || "localhost"}:${this.config.port}`
            );
          }
        );
      }
    });
  }
}
