import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CreateUserSchema, LoginSchema } from "@zenith/shared";
import bcrypt from "bcryptjs";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register
  app.post("/register", async (request, reply) => {
    const body = CreateUserSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const { email, name, password } = body.data;

    const existing = await app.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await app.prisma.user.create({
      data: { email, name, password: hashed },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return reply.code(201).send({ user, token });
  });

  // POST /api/auth/login
  app.post("/login", async (request, reply) => {
    const body = LoginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const { email, password } = body.data;
    const user = await app.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return reply.send({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  });

  // GET /api/auth/me  (protected)
  app.get(
    "/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.user as { id: string };
      const user = await app.prisma.user.findUniqueOrThrow({
        where: { id },
        select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
      });
      return reply.send(user);
    }
  );
}
