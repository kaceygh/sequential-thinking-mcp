import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TRANSPORT = process.env.TRANSPORT || 'streamable-http';

// Create MCP Server with tools capability
const server = new Server({
  name: 'sequential-thinking',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Define tool schemas
const SequentialThinkingSchema = z.object({
  thought: z.string().describe('Current thinking step'),
  nextThoughtNeeded: z.boolean().describe('Whether another thought step is needed'),
  thoughtNumber: z.number().int().positive().describe('Current thought number'),
  totalThoughts: z.number().int().positive().describe('Estimated total thoughts needed'),
  isRevision: z.boolean().optional().describe('Whether this revises previous thinking'),
  revisesThought: z.number().int().positive().optional().describe('Which thought is being reconsidered'),
  branchFromThought: z.number().int().positive().optional().describe('Branching point thought number'),
  branchId: z.string().optional().describe('Branch identifier'),
  needsMoreThoughts: z.boolean().optional().describe('If more thoughts are needed'),
});

const UltraThinkSchema = z.object({
  problem: z.string().describe('Complex problem requiring deep reasoning'),
  steps: z.number().int().positive().optional().default(10).describe('Number of reasoning steps'),
});

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'sequential_thinking',
        description: 'Use sequential thinking to analyze problems step by step',
        inputSchema: SequentialThinkingSchema,
      },
      {
        name: 'ultrathink',
        description: 'Initiate deep reasoning for complex problems',
        inputSchema: UltraThinkSchema,
      },
    ],
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'sequential_thinking') {
    const {
      thought,
      nextThoughtNeeded,
      thoughtNumber,
      totalThoughts,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
      needsMoreThoughts,
    } = args;

    // Log the thinking step
    const prefix = isRevision 
      ? '🔄 Revision' 
      : branchFromThought 
        ? `🌿 Branch (from #${branchFromThought})` 
        : `💭 Thought ${thoughtNumber}/${totalThoughts}`;
    console.error(`[Sequential Thinking] ${prefix}: ${thought}`);

    // Return the thought back to the model for continuation
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            thought,
            thoughtNumber,
            totalThoughts,
            nextThoughtNeeded,
            isRevision,
            revisesThought,
            branchFromThought,
            branchId,
            needsMoreThoughts,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  if (name === 'ultrathink') {
    const { problem, steps } = args;
    console.error(`[UltraThink] Starting deep analysis: ${problem}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `UltraThink initiated for: "${problem}"\nPlanned steps: ${steps}\n\nUse sequential_thinking tool to work through this step by step.`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Store transports for SSE
const sseTransports = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', transport: TRANSPORT, timestamp: new Date().toISOString() });
});

// Streamable HTTP Transport (new standard)
if (TRANSPORT === 'streamable-http' || TRANSPORT === 'both') {
  app.all('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      enableJsonResponse: true,
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });
}

// SSE Transport
if (TRANSPORT === 'sse' || TRANSPORT === 'both') {
  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Sequential Thinking MCP Server running on port ${PORT}`);
  console.log(`Transport: ${TRANSPORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (TRANSPORT === 'streamable-http' || TRANSPORT === 'both') {
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  }
  if (TRANSPORT === 'sse' || TRANSPORT === 'both') {
    console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  }
});
