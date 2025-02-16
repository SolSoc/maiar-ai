import fs from "fs";
import path from "path";
import pino from "pino";

// Ensure logs directory exists and clear model interactions log file
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const modelLogPath = path.join(logsDir, "model-interactions.log");
fs.writeFileSync(modelLogPath, ""); // Clear file on startup

interface SerializedError {
  type: string;
  message: string;
  stack: string;
}

interface SerializedContextItem {
  pluginId: string;
  action: string;
  timestamp: number;
  [key: string]: unknown;
}

// Custom serializers for better formatting
const customSerializers = {
  // Improved error serializer that formats stack traces better
  error: (error: Error): SerializedError | unknown => {
    if (!error || !error.stack) return error;
    const lines = error.stack.split("\n");
    return {
      type: error.name,
      message: error.message,
      stack: lines
        .slice(1)
        .map((line) => line.trim())
        .join("\n  ")
    };
  },

  // Format large text/JSON blocks better
  object: (obj: unknown): unknown => {
    if (typeof obj !== "object" || obj === null) return obj;

    // Handle special cases for known large objects
    const objRecord = obj as Record<string, unknown>;
    if (objRecord.contextChain && Array.isArray(objRecord.contextChain)) {
      return {
        ...objRecord,
        contextChain: objRecord.contextChain.map((item: unknown) => {
          const contextItem = item as SerializedContextItem;
          const base = {
            pluginId: contextItem.pluginId,
            action: contextItem.action,
            timestamp: contextItem.timestamp
          };

          // Only include other fields if they're not too large
          const additional = Object.entries(contextItem)
            .filter(([k]) => !["pluginId", "action", "timestamp"].includes(k))
            .reduce<Record<string, unknown>>((acc, [k, v]) => {
              const str = typeof v === "string" ? v : JSON.stringify(v);
              if (str.length > 100) {
                acc[k] = str.substring(0, 100) + "... (truncated)";
              } else {
                acc[k] = v;
              }
              return acc;
            }, {});

          return { ...base, ...additional };
        })
      };
    }

    return obj;
  }
};

// Create base logger instance
const baseLogger = pino({
  serializers: customSerializers,
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      messageFormat: "{component}: {msg}"
    }
  }
});

// Separate logger for model interactions
const modelLogger = pino(
  {
    serializers: customSerializers,
    level: "info",
    // Format the log entries directly in the logger configuration
    formatters: {
      level: (label) => ({ level: label }),
      log: (object) => {
        if (object.prompt) {
          return {
            output: `\nType: ${object.type}\nModel: ${object.model}\n\nPrompt:\n${object.prompt}\n`
          };
        } else if (object.response) {
          return {
            output: `\nType: ${object.type}\nModel: ${object.model}\n\nResponse:\n${object.response}\n`
          };
        } else if (object.error) {
          return {
            output: `\nType: ${object.type}\nModel: ${object.model}\nError: ${object.error}\n`
          };
        }
        return object;
      }
    }
  },
  pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      messageKey: "output",
      destination: modelLogPath,
      singleLine: false
    }
  })
);

/**
 * Log model interactions to a separate file
 */
export function logModelInteraction(
  type: "prompt" | "messages" | "system" | "response" | "error",
  data: Record<string, unknown>
): void {
  modelLogger.info({
    type,
    timestamp: Date.now(),
    ...data
  });
}

/**
 * Create a logger instance for a specific component
 */
export const createLogger = (component: string) =>
  baseLogger.child({ component });
