import type { FastifyRequest, FastifyReply } from "fastify";
import type { Role } from "@zenith/shared";

/**
 * Role hierarchy: OWNER > ADMIN > EDITOR > VIEWER
 * A user satisfies a required role if their assigned role is ≥ the required level.
 */
const ROLE_WEIGHT: Record<Role, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function requireRole(minimumRole: Role) {
  return async (
    request: FastifyRequest<{ Params: { workspaceId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = (request.user as { id: string } | undefined)?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const { workspaceId } = request.params;
    const membership = await request.server.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      select: { role: true },
    });

    if (!membership) {
      return reply.code(403).send({ error: "Forbidden" });
    }

    const userWeight = ROLE_WEIGHT[membership.role as Role];
    const requiredWeight = ROLE_WEIGHT[minimumRole];

    if (userWeight < requiredWeight) {
      return reply.code(403).send({ error: "Insufficient permissions" });
    }
  };
}
