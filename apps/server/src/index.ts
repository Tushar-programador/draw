import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

import prismaPlugin from "./plugins/prisma.js";
import mongoPlugin from "./plugins/mongo.js";
import { authRoutes } from "./routes/auth.js";
import { workspaceRoutes } from "./routes/workspaces.js";
import { documentRoutes } from "./routes/documents.js";
import { aiRoutes } from "./routes/ai.js";
import { createHocuspocusServer } from "./hocuspocus/server.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const PORT = Number(process.env["PORT"] ?? 3001);
const HOST = process.env["HOST"] ?? "0.0.0.0";
const SELF_PING_INTERVAL_MS = Number(process.env["SELF_PING_INTERVAL_MS"] ?? 5 * 60 * 1000);
const SELF_PING_URL =
  process.env["SELF_PING_URL"] ??
  (process.env["RENDER_EXTERNAL_URL"]
    ? `${process.env["RENDER_EXTERNAL_URL"].replace(/\/+$/, "")}/health`
    : "");

// ─── Build Fastify on a plain HTTP server ────────────────────────────────────
const httpServer = createServer();

const app = Fastify({
  serverFactory: (handler) => {
    httpServer.on("request", handler);
    return httpServer;
  },
  logger: {
    level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
    ...(process.env["NODE_ENV"] !== "production"
      ? { transport: { target: "pino-pretty", options: { colorize: true } } }
      : {}),
  },
});

// ─── Security ─────────────────────────────────────────────────────────────────
await app.register(fastifyHelmet);
await app.register(fastifyRateLimit, { max: 200, timeWindow: "1 minute" });
await app.register(fastifyCors, {
  origin: process.env["NODE_ENV"] === "production" ? false : true,
  credentials: true,
});

// ─── Auth ──────────────────────────────────────────────────────────────────────
const jwtSecret = process.env["JWT_SECRET"];
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");

await app.register(fastifyJwt, { secret: jwtSecret });

app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// ─── Database plugins ─────────────────────────────────────────────────────────
await app.register(prismaPlugin);
await app.register(mongoPlugin);

// ─── API Routes ───────────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(workspaceRoutes, { prefix: "/api/workspaces" });
await app.register(documentRoutes, { prefix: "/api/workspaces" });
await app.register(aiRoutes, { prefix: "/api/ai" });

// ─── Socket.io + Hocuspocus ───────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

createHocuspocusServer(app.mongo, io);

io.on("connection", (socket) => {
  app.log.info(`Socket connected: ${socket.id}`);

  socket.on("join-document", (documentId: string) => {
    void socket.join(`doc:${documentId}`);
    socket.to(`doc:${documentId}`).emit("user-joined", { socketId: socket.id });
  });

  socket.on("cursor-move", (data: { documentId: string; x: number; y: number }) => {
    socket.to(`doc:${data.documentId}`).emit("cursor-update", {
      socketId: socket.id,
      x: data.x,
      y: data.y,
    });
  });

  socket.on("disconnect", () => {
    app.log.info(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

function startSelfPing() {
  if (!SELF_PING_URL) {
    app.log.info("Self-ping disabled (set SELF_PING_URL or RENDER_EXTERNAL_URL to enable it).");
    return;
  }

  const ping = async () => {
    try {
      const response = await fetch(SELF_PING_URL, { method: "GET" });
      if (!response.ok) {
        app.log.warn(`Self-ping returned status ${response.status} from ${SELF_PING_URL}`);
      }
    } catch (error) {
      app.log.warn({ error }, `Self-ping failed for ${SELF_PING_URL}`);
    }
  };

  void ping();
  const timer = setInterval(() => {
    void ping();
  }, SELF_PING_INTERVAL_MS);
  timer.unref();

  app.log.info(`Self-ping enabled: ${SELF_PING_URL} every ${SELF_PING_INTERVAL_MS}ms`);
}

// ─── Start ────────────────────────────────────────────────────────────────────
try {
  await app.ready();
  httpServer.listen({ port: PORT, host: HOST }, () => {
    app.log.info(`OUTDRAW server running on http://${HOST}:${PORT}`);
    startSelfPing();
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
