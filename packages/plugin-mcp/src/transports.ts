import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

import { ServerConfig, StdioConfig, StreamableHttpConfig } from "./types";

export function clientCommand(
  command?: string,
  serverScriptPath?: string
): string {
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
export function buildTransport(
  config: ServerConfig
): StdioClientTransport | StreamableHTTPClientTransport {
  let transport;
  if ("url" in config) {
    const url = new URL(config.url);
    transport = new StreamableHTTPClientTransport(url);
  } else {
    const { serverScriptPath, command, args = [], env } = config as StdioConfig;

    const cmd = clientCommand(command, serverScriptPath);

    // put the script path as first argument
    if (serverScriptPath) args.unshift(serverScriptPath);

    const processEnv = Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== undefined) as [
        string,
        string
      ][]
    );
    transport = new StdioClientTransport({
      command: cmd,
      args,
      env: {
        ...processEnv,
        ...(env || {})
      }
    });
  }
  return transport;
}
