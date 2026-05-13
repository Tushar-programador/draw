import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CreateWorkspaceSchema, InviteMemberSchema } from "@outdraw/shared";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
import { requireRole } from "../middleware/rbac.js";

export async function workspaceRoutes(app: FastifyInstance) {
  // All workspace routes require authentication
  app.addHook("preHandler", app.authenticate);

  // GET /api/workspaces
  app.get("/", async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const memberships = await app.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return reply.send(memberships.map((m: (typeof memberships)[number]) => m.workspace));
  });

  // POST /api/workspaces
  app.post("/", async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const body = CreateWorkspaceSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const workspace = await app.prisma.workspace.create({
      data: {
        ...body.data,
        ownerId: userId,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
    });

    return reply.code(201).send(workspace);
  });

  // GET /api/workspaces/:workspaceId
  app.get(
    "/:workspaceId",
    { preHandler: [requireRole("VIEWER")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const workspace = await app.prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
      });
      return reply.send(workspace);
    }
  );

  // POST /api/workspaces/:workspaceId/members — invite a new member (ADMIN+)
  app.post(
    "/:workspaceId/members",
    { preHandler: [requireRole("ADMIN")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const body = InviteMemberSchema.safeParse(request.body);
      if (!body.success) {
        return reply.code(400).send({ error: body.error.flatten() });
      }

      const target = await app.prisma.user.findUnique({ where: { email: body.data.email } });
      if (!target) return reply.code(404).send({ error: "User not found" });

      const member = await app.prisma.workspaceMember.create({
        data: { userId: target.id, workspaceId, role: body.data.role },
      });

      return reply.code(201).send(member);
    }
  );
}
