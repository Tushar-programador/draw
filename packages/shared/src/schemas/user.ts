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

export const RequestEmailOtpSchema = z.object({
  email: z.string().email(),
});
export type RequestEmailOtp = z.infer<typeof RequestEmailOtpSchema>;

export const VerifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
});
export type VerifyEmailOtp = z.infer<typeof VerifyEmailOtpSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase, and a number"
    ),
});
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;

export const GoogleDriveConnectSchema = z.object({
  accessToken: z.string().min(20),
  expiresIn: z.number().int().positive(),
});
export type GoogleDriveConnect = z.infer<typeof GoogleDriveConnectSchema>;

export const PublicUserSchema = UserSchema.omit({ updatedAt: true });
export type PublicUser = z.infer<typeof PublicUserSchema>;
