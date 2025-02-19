import { Context } from "telegraf";
import { z } from "zod";
import { PluginTelegram } from "./plugin";
import { Guard } from "telegraf/typings/core/helpers/util";
import { Update } from "telegraf/typings/core/types/typegram";

interface TelegramHandler {
  filter: Guard<Update>;
  handler: (ctx: Context, next?: () => Promise<void>) => Promise<void>;
}

export interface TelegramPluginConfig {
  token?: string; // It's optional so we can load from the environment, but we check it in the constructor to make sure it's set

  handlers: TelegramHandler[]; // Handlers to register
  // Optional configuration
  pollingTimeout?: number; // Polling timeout in seconds
  dropPendingUpdates?: boolean; // Whether to drop pending updates on start
}

export interface TelegramMessage {
  chatId: number;
  text: string;
  username?: string;
}

export interface TelegramContext extends Context {
  plugin?: PluginTelegram;
}

export const TelegramResponseSchema = z.object({
  message: z.string()
});
