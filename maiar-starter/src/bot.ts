import { createLogger, UserInputContext } from "@maiar-ai/core";
import {
  PluginTelegram,
  TelegramMessage,
  TelegramPlatformContext
} from "@maiar-ai/plugin-telegram";
import { Composer, Context } from "telegraf";

const composer = new Composer();

const log = createLogger("plugin-telegram");

composer.command("do_action", async (ctx) => {
  return await ctx.reply("Did some action.");
});

composer.on("message", async (ctx: Context) => {
  try {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) return;
    if (!("plugin" in ctx)) return;

    const message: TelegramMessage = {
      chatId: ctx.message.chat.id,
      text: ctx.message.text,
      username: ctx.message.from?.username
    };

    // telegram id
    // twitter id
    // call internal loading => scoped to teh bot.
    const plugin = ctx.plugin as PluginTelegram;
    const pluginId = plugin.id;
    const userContext: UserInputContext = {
      id: `${pluginId}-${ctx.message.message_id}`,
      pluginId: pluginId,
      type: "user_input",
      action: "receiveMessage",
      content: message.text,
      timestamp: Date.now(),
      rawMessage: message.text,
      user: message.username || "unknown",
      messageHistory: [
        {
          role: "user",
          content: message.text,
          timestamp: Date.now()
        }
      ],
      helpfulInstruction: `Message from Telegram user ${message.username || "unknown"}`
    };

    const platformContext: TelegramPlatformContext = {
      platform: pluginId,
      responseHandler: async (response: unknown) => {
        await ctx.reply(String(response), { parse_mode: "HTML" });
      },
      metadata: {
        chatId: message.chatId
      }
    };

    try {
      await plugin.runtime.createEvent(userContext, platformContext);
      log.debug("Successfully queued Telegram message for processing");
    } catch (error) {
      log.error("Failed to queue Telegram message", {
        error: error instanceof Error ? error.message : String(error),
        user: message.username,
        chatId: message.chatId
      });
    }
  } catch (error) {
    log.error("Error processing Telegram message", {
      error: error instanceof Error ? error.message : String(error),
      ctx: {
        chatId: ctx.message?.chat.id,
        username: ctx.message?.from?.username
      }
    });
  }
});

export default composer;
