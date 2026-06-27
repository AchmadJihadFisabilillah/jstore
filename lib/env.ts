import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  MANDIRI_PAYMENT_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),

  MANDIRI_ENV: z.enum(["sandbox", "production"]).optional().default("sandbox"),

  // URLs
  MANDIRI_BASE_URL: z.string().url().optional(),
  MANDIRI_TOKEN_URL: z.string().url().optional(),
  
  // Credentials (hanya wajib jika MANDIRI_PAYMENT_ENABLED = true)
  MANDIRI_MERCHANT_ID: z.string().optional(),
  MANDIRI_CLIENT_ID: z.string().optional(),
  MANDIRI_CLIENT_SECRET: z.string().optional(),
  MANDIRI_TERMINAL_ID: z.string().optional(),
  MANDIRI_WEBHOOK_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  _env.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
