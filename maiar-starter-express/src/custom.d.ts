import { PluginExpress } from "@maiar-ai/plugin-express";

declare global {
  namespace Express {
    interface Request {
      plugin?: PluginExpress;
    }
  }
}
