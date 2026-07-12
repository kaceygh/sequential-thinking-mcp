import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import http from 'http';

// 创建 HTTP 服务器专门处理健康检查
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// 监听健康检查端口（与主服务不同端口）
healthServer.listen(10000, () => {
  console.log('✅ Health check server running on port 10000');
});

const server = new McpServer({
  name: "sequential-thinking",
  version: "1.0.0",
});

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
    content: [{
      type: "text",
      text: JSON.stringify({
        acknowledged: true,
        thoughtNumber: args.thoughtNumber,
        totalThoughts: args.totalThoughts,
        nextThoughtNeeded: args.nextThoughtNeeded,
        branchId: args.branchId,
      })
    }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.log("✅ MCP Server running on stdio");
