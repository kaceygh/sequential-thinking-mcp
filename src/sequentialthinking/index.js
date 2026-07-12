import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
import { z } from "zod";
import http from 'http';

// 创建 MCP 服务器
const server = new McpServer({
  name: "sequential-thinking",
  version: "1.0.0",
});

// 注册工具
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

// 创建 HTTP 服务器
const httpServer = http.createServer();

// 将 MCP 服务器绑定到 HTTP 服务器
const transport = new HttpServerTransport(httpServer);
await server.connect(transport);

// 健康检查路由
httpServer.on('request', (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// 启动服务器
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ MCP Server running on port ${PORT}`);
});
