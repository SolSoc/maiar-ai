import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

import { ServerConfig, StdioConfig, StreamableHttpConfig } from "./types";

export function clientCommand(
  command: string | undefined,
  serverScriptPath: string | undefined
) {
  let result;

  if (command) {
    result = command;
  } else if (serverScriptPath) {
    const isPython = serverScriptPath.endsWith(".py");
    result = isPython
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;
  } else {
    throw new Error(
      "MCP config needs either {command,args} or serverScriptPath"
    );
  }

  return result;
}

export function buildTransport(config: StdioConfig): StdioClientTransport;
export function buildTransport(
  config: StreamableHttpConfig
): StreamableHTTPClientTransport;
export function buildTransport(config: ServerConfig) {
  let transport;
  if ("url" in config) {
    transport = new StreamableHTTPClientTransport(new URL(config.url));
  } else {
    const {
      serverScriptPath,
      command: tempCommand = "",
      args = [],
      env
    } = config as StdioConfig;

    const command = clientCommand(tempCommand, serverScriptPath);

    if (serverScriptPath) {
      // put the script path as first argument
      args.unshift(serverScriptPath);
    }
    const processEnv = Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== undefined) as [
        string,
        string
      ][]
    );
    transport = new StdioClientTransport({
      command,
      args,
      env: {
        ...processEnv,
        ...(env || {})
      }
    });
  }
  return transport;
}
