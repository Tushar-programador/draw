import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  CreateUserSchema,
  ForgotPasswordSchema,
  GoogleDriveConnectSchema,
  LoginSchema,
  RequestEmailOtpSchema,
  ResetPasswordSchema,
  VerifyEmailOtpSchema,
} from "@zenith/shared";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function authRoutes(app: FastifyInstance) {
  const otpExpiryMs = 10 * 60 * 1000;

  const createOtp = () => String(randomInt(100000, 1000000));

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
      data: { email, name, password: hashed, emailVerified: false },
      select: { id: true, email: true, name: true, emailVerified: true, createdAt: true },
    });

    const otp = createOtp();
    await app.prisma.emailOtp.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + otpExpiryMs),
      },
    });
    app.log.info({ email, otp }, "Email verification OTP generated");

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return reply.code(201).send({
      user,
      token,
      message: "Account created. Verify your email with OTP.",
      ...(process.env["NODE_ENV"] !== "production" ? { devOtp: otp } : {}),
    });
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
      user: { id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified },
      token,
    });
  });

  // POST /api/auth/request-email-otp
  app.post("/request-email-otp", async (request, reply) => {
    const body = RequestEmailOtpSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const user = await app.prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user) {
      return reply.send({ message: "If the email exists, an OTP has been sent." });
    }

    const otp = createOtp();
    await app.prisma.emailOtp.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + otpExpiryMs),
      },
    });
    app.log.info({ email: body.data.email, otp }, "Email verification OTP regenerated");

    return reply.send({
      message: "OTP generated.",
      ...(process.env["NODE_ENV"] !== "production" ? { devOtp: otp } : {}),
    });
  });

  // POST /api/auth/verify-email-otp
  app.post("/verify-email-otp", async (request, reply) => {
    const body = VerifyEmailOtpSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const user = await app.prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user) return reply.code(404).send({ error: "User not found" });

    const otp = await app.prisma.emailOtp.findFirst({
      where: { userId: user.id, code: body.data.otp, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return reply.code(400).send({ error: "Invalid or expired OTP" });

    await app.prisma.$transaction([
      app.prisma.emailOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
      app.prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
    ]);

    return reply.send({ message: "Email verified successfully" });
  });

  // POST /api/auth/forgot-password
  app.post("/forgot-password", async (request, reply) => {
    const body = ForgotPasswordSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const user = await app.prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user) return reply.send({ message: "If the email exists, reset OTP has been sent." });

    const otp = createOtp();
    await app.prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + otpExpiryMs),
      },
    });
    app.log.info({ email: body.data.email, otp }, "Password reset OTP generated");

    return reply.send({
      message: "Password reset OTP generated.",
      ...(process.env["NODE_ENV"] !== "production" ? { devOtp: otp } : {}),
    });
  });

  // POST /api/auth/reset-password
  app.post("/reset-password", async (request, reply) => {
    const body = ResetPasswordSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const user = await app.prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user) return reply.code(404).send({ error: "User not found" });

    const otp = await app.prisma.passwordResetOtp.findFirst({
      where: { userId: user.id, code: body.data.otp, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return reply.code(400).send({ error: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(body.data.newPassword, 12);
    await app.prisma.$transaction([
      app.prisma.passwordResetOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
      app.prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    ]);

    return reply.send({ message: "Password reset successful" });
  });

  // POST /api/auth/google-drive/connect
  app.post("/google-drive/connect", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = GoogleDriveConnectSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const { id: userId } = request.user as { id: string };
    const expiry = new Date(Date.now() + body.data.expiresIn * 1000);

    await app.prisma.user.update({
      where: { id: userId },
      data: {
        googleDriveConnected: true,
        googleDriveAccessToken: body.data.accessToken,
        googleDriveTokenExpiry: expiry,
      },
    });

    return reply.send({ connected: true, expiresAt: expiry.toISOString() });
  });

  // POST /api/auth/google-drive/save-metadata
  app.post("/google-drive/save-metadata", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = request.body as {
      documentId?: string;
      driveFileId?: string;
      driveWebViewLink?: string;
    };

    if (!body.documentId || !body.driveFileId) {
      return reply.code(400).send({ error: "documentId and driveFileId are required" });
    }

    const updated = await app.prisma.documentMeta.update({
      where: { id: body.documentId },
      data: {
        driveFileId: body.driveFileId,
        driveWebViewLink: body.driveWebViewLink ?? null,
        lastSyncedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        driveFileId: true,
        driveWebViewLink: true,
        lastSyncedAt: true,
      },
    });

    return reply.send(updated);
  });

  // GET /api/auth/dashboard/files
  app.get("/dashboard/files", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const memberships = await app.prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true },
    });
    const workspaceIds = memberships.map((m) => m.workspaceId);

    const docs = await app.prisma.documentMeta.findMany({
      where: { workspaceId: { in: workspaceIds }, isArchived: false },
      include: {
        workspace: { select: { id: true, name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return reply.send(
      docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        stage: doc.stage,
        workspaceId: doc.workspaceId,
        workspaceName: doc.workspace.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        authorName: doc.creator.name,
        driveFileId: doc.driveFileId,
        driveWebViewLink: doc.driveWebViewLink,
        lastSyncedAt: doc.lastSyncedAt,
      }))
    );
  });

  // GET /api/auth/me  (protected)
  app.get(
    "/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.user as { id: string };
      const user = await app.prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          emailVerified: true,
          googleDriveConnected: true,
          googleDriveTokenExpiry: true,
        },
      });
      return reply.send(user);
    }
  );
}
