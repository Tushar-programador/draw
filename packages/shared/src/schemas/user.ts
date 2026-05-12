import { z } from "zod";

// ─── Role Enum ────────────────────────────────────────────────────────────────
export const RoleSchema = z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]);
export type Role = z.infer<typeof RoleSchema>;

// ─── User ─────────────────────────────────────────────────────────────────────
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.pick({
  email: true,
  name: true,
}).extend({
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase, and a number"
    ),
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type Login = z.infer<typeof LoginSchema>;

export const PublicUserSchema = UserSchema.omit({ updatedAt: true });
export type PublicUser = z.infer<typeof PublicUserSchema>;
