# @maiar-ai/plugin-telegram

This package is part of the [Maiar](https://maiar.dev) ecosystem, designed to work seamlessly with `@maiar-ai/core`.

## Documentation

For detailed documentation, examples, and API reference, visit:
https://maiar.dev/docs

## Configuration

The Telegram plugin requires the following configuration:

```typescript
interface TelegramPluginConfig {
  token: string; // Telegram bot token
  composer: Composer<TelegramContext>; // Handlers to register
  // Optional configuration
  pollingTimeout?: number; // Polling timeout in seconds
  dropPendingUpdates?: boolean; // Whether pending updates are dropped on start/restart
}
```

### Required Configuration

- `token`: Your telegram bot token issued by BotFather
- `composer`: A telegraf composer middleware

### Optional Configuration

- `pollingTimeout`: How often the bot will check for updates (default: 30)
- `dropPendingUpdates`: Whether or not the bot will drop pending updates (default: false)

## Plugin Information

### Actions

- `send_response`: Send a response to a telegram chat using the `responseHandler` provided on `context.platformContext.responseHandler`

For more detailed examples and advanced usage, visit our [documentation](https://maiar.dev/docs).
