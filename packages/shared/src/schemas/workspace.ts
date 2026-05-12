import { z } from "zod";
import { RoleSchema } from "./user.js";

// ─── Workspace ────────────────────────────────────────────────────────────────
export const WorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(150),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  ownerId: z.string().cuid(),
  isEncrypted: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CreateWorkspaceSchema = WorkspaceSchema.pick({
  name: true,
  slug: true,
  isEncrypted: true,
});
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;

// ─── Workspace Member ─────────────────────────────────────────────────────────
export const WorkspaceMemberSchema = z.object({
  userId: z.string().cuid(),
  workspaceId: z.string().cuid(),
  role: RoleSchema,
  joinedAt: z.coerce.date(),
});
export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: RoleSchema.exclude(["OWNER"]),
});
export type InviteMember = z.infer<typeof InviteMemberSchema>;
