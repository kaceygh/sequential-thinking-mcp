// src/index.js - 正确的 stdio 版本
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "sequential-thinking", version: "1.0.0" });

server.tool(
  "sequential_thinking",
  "结构化逐步推理工具",
  {
    thought: z.string(),
    nextThoughtNeeded: z.boolean(),
    thoughtNumber: z.number().int().positive(),
    totalThoughts: z.number().int().positive(),
    isRevision: z.boolean().optional(),
    revisesThought: z.number().int().positive().optional(),
    branchFromThought: z.number().int().positive().optional(),
    branchId: z.string().optional(),
    needsMoreThoughts: z.boolean().optional(),
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify({
      acknowledged: true,
      thoughtNumber: args.thoughtNumber,
      totalThoughts: args.totalThoughts,
      nextThoughtNeeded: args.nextThoughtNeeded,
      branchId: args.branchId,
    }) }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Sequential Thinking MCP Server running on stdio");
