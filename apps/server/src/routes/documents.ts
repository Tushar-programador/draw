import type { FastifyInstance } from "fastify";
import { CreateDocumentSchema, UpdateDocumentSchema } from "@zenith/shared";
import { requireRole } from "../middleware/rbac.js";

export async function documentRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  // GET /api/workspaces/:workspaceId/documents
  app.get(
    "/:workspaceId/documents",
    { preHandler: [requireRole("VIEWER")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const docs = await app.prisma.documentMeta.findMany({
        where: { workspaceId, isArchived: false },
        orderBy: { updatedAt: "desc" },
      });
      return reply.send(docs);
    }
  );

  // POST /api/workspaces/:workspaceId/documents
  app.post(
    "/:workspaceId/documents",
    { preHandler: [requireRole("EDITOR")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const { id: userId } = request.user as { id: string };
      const body = CreateDocumentSchema.safeParse({ ...(request.body as object), workspaceId });
      if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

      const doc = await app.prisma.documentMeta.create({
        data: {
          workspaceId,
          title: body.data.title ?? "Untitled Canvas",
          createdBy: userId,
        },
      });

      return reply.code(201).send(doc);
    }
  );

  // PATCH /api/workspaces/:workspaceId/documents/:documentId
  app.patch(
    "/:workspaceId/documents/:documentId",
    { preHandler: [requireRole("EDITOR")] },
    async (request, reply) => {
      const { documentId } = request.params as { workspaceId: string; documentId: string };
      const body = UpdateDocumentSchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

      const doc = await app.prisma.documentMeta.update({
        where: { id: documentId },
        data: body.data,
      });

      return reply.send(doc);
    }
  );

  // DELETE /api/workspaces/:workspaceId/documents/:documentId (archive)
  app.delete(
    "/:workspaceId/documents/:documentId",
    { preHandler: [requireRole("EDITOR")] },
    async (request, reply) => {
      const { documentId } = request.params as { workspaceId: string; documentId: string };
      await app.prisma.documentMeta.update({
        where: { id: documentId },
        data: { isArchived: true },
      });
      return reply.code(204).send();
    }
  );
}
