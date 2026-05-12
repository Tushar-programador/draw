import { z } from "zod";

// ─── Document (MongoDB stored state) ─────────────────────────────────────────
export const DocumentSchema = z.object({
  id: z.string().cuid(),
  workspaceId: z.string().cuid(),
  title: z.string().min(1).max(200).default("Untitled Canvas"),
  stage: z.enum(["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"]).default("BACKLOG"),
  /** Serialised Yjs document snapshot stored as Base64 */
  yjsSnapshot: z.string().optional(),
  thumbnailUrl: z.string().url().nullable().default(null),
  driveFileId: z.string().nullable().default(null),
  driveWebViewLink: z.string().url().nullable().default(null),
  lastSyncedAt: z.coerce.date().nullable().default(null),
  isArchived: z.boolean().default(false),
  createdBy: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const CreateDocumentSchema = DocumentSchema.pick({
  workspaceId: true,
  title: true,
});
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;

export const UpdateDocumentSchema = DocumentSchema.pick({
  title: true,
  stage: true,
  isArchived: true,
}).partial();
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;

// ─── Collaboration Room ───────────────────────────────────────────────────────
export const CollabRoomSchema = z.object({
  roomId: z.string(),
  documentId: z.string().cuid(),
  /** ISO timestamp of last Yjs update */
  lastModified: z.coerce.date(),
});
export type CollabRoom = z.infer<typeof CollabRoomSchema>;

// ─── AI Request ───────────────────────────────────────────────────────────────
export const AISketchRequestSchema = z.object({
  documentId: z.string().cuid(),
  /** Base64-encoded PNG of the canvas selection */
  imageData: z.string().min(1),
  targetFormat: z.enum(["react-component", "terraform", "mermaid", "css"]),
  useLocal: z.boolean().default(false),
});
export type AISketchRequest = z.infer<typeof AISketchRequestSchema>;

export const AIResponseSchema = z.object({
  requestId: z.string().cuid(),
  code: z.string(),
  language: z.string(),
  model: z.string(),
  tokensUsed: z.number().int().optional(),
});
export type AIResponse = z.infer<typeof AIResponseSchema>;
