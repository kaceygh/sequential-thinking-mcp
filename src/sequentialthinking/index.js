// Sequential Thinking MCP Server (stdio → SSE via supergateway)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "sequential-thinking",
  version: "1.0.0",
  healthCheck: () => ({ status: "ok" })
});

server.tool(
  "sequential_thinking",
  "结构化逐步推理工具：将复杂问题拆解为可管理的思考步骤，支持分支、修正、动态调整步数",
  {
    thought: z.string().describe("当前思考步骤的内容"),
    nextThoughtNeeded: z.boolean().describe("是否需要继续下一步思考"),
    thoughtNumber: z.number().int().positive().describe("当前步骤编号（从 1 开始）"),
    totalThoughts: z.number().int().positive().describe("预估总步骤数"),
    isRevision: z.boolean().optional().describe("是否为修正先前思考"),
    revisesThought: z.number().int().positive().optional().describe("被修正的步骤编号"),
    branchFromThought: z.number().int().positive().optional().describe("分支起始步骤编号"),
    branchId: z.string().optional().describe("分支标识符"),
    needsMoreThoughts: z.boolean().optional().describe("是否需要更多步骤"),
  },
  async (args) => {
    // 协议层确认：记录思考链，实际推理由客户端完成
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              acknowledged: true,
              thoughtNumber: args.thoughtNumber,
              totalThoughts: args.totalThoughts,
              nextThoughtNeeded: args.nextThoughtNeeded,
              branchId: args.branchId ?? null,
              isRevision: args.isRevision ?? false,
              revisesThought: args.revisesThought ?? null,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

const port = process.env.PORT || 3000;
console.log(`Server will run on port: ${port}`);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ Sequential Thinking MCP Server running on stdio");
