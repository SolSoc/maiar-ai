import { PluginExpress } from "./plugin";

declare global {
  namespace Express {
    interface Request {
      plugin?: PluginExpress;
    }
  }
}
